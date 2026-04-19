import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"
import { getHighestAvailableHitDieDenomination } from "./getHighestAvailableHitDieDenomination.js"
import {
    buildPresentedRollData,
    buildSyntheticActivityButton,
    injectGiftOfDamnationCard,
    replaceGiftOfDamnationCard,
    renderGiftOfDamnationCard
} from "./GiftOfDamnationMidiCard.js"

export class GiftOfUnbridledPower
{
    static id = "giftOfUnbridledPower"
    static label = "Gift of Unbridled Power"
    static stage = 4
    static itemUuid = "Compendium.transformations.gh-transformations.Item.x7OlLmg3FMTF0WSv"
    static description = "Upon finishing a Short Rest, you can spend 2 Hit Point Dice and regain a number of spell slot levels equal to the highest number rolled. However, you take Psychic damage equal to twice the total that you rolled. You regain the reuse of this gift when you finish a Long Rest."
    static actions = {

        async roll({
            actor,
            message,
            actorRepository,
            RollService,
            ChatMessagePartInjector,
            GiftClass
        })
        {
            const hitDie = message.flags?.transformations?.hitDie
            const availableHitDice = GiftClass.getAvailableHitDice(
                actor,
                actorRepository
            )
            if (!hitDie || availableHitDice < 2) return

            const rollFormula = `2${hitDie}`
            const roll = await RollService.simpleRoll(rollFormula)
            const presentedRoll = await buildPresentedRollData(roll, {
                formula: rollFormula
            })

            await actorRepository.consumeHitDie(actor, 2)

            await message.update({
                "flags.transformations.state": "rolled",
                "flags.transformations.rollFormula": rollFormula,
                "flags.transformations.recoveryBudget": roll.total,
                "flags.transformations.presentedRoll": presentedRoll
            })

            void ChatMessagePartInjector

            await replaceGiftOfDamnationCard({
                GiftClass,
                message,
                content: await GiftClass.renderCard({
                    actor,
                    message,
                    state: "rolled",
                    roll
                })
            })
        },

        async recoverSpellSlots({
            actor,
            message,
            actorRepository,
            dialogFactory,
            ChatMessagePartInjector,
            GiftClass
        })
        {
            const recoveryBudget =
                      Number(message.flags?.transformations?.recoveryBudget ?? 0)
            if (recoveryBudget <= 0) return

            const selectedSpellSlots =
                      await dialogFactory?.openFiendUnbridledPowerSpellSlotRecovery?.({
                          actor,
                          amount: recoveryBudget,
                          triggeringUserId: game.user?.id ?? null
                      })

            if (!Array.isArray(selectedSpellSlots) || selectedSpellSlots.length === 0) {
                return
            }

            await GiftClass.restoreSpellSlots(actor, selectedSpellSlots)
            await actorRepository.applyDamage(actor, recoveryBudget * 2)
            await GiftClass.complete(message, ChatMessagePartInjector)
        }
    }

    static async apply({actor, actorRepository, itemRepository}) {
        const sourceItem = this.itemUuid
            ? await fromUuid(this.itemUuid)
            : null

        return applyGiftOfDamnation({
            actor,
            giftClass: this,
            itemRepository,
            actorRepository,
            sourceItem,
            changes: []
        })
    }

    static async giftActivity({
        actor,
        message,
        actorRepository,
        ChatMessagePartInjector
    })
    {
        const hitDie = this.getHighestAvailableHitDie(actor, actorRepository)
        const availableHitDice = this.getAvailableHitDice(actor, actorRepository)
        if (!hitDie || availableHitDice < 2) return

        await message.update({
            "flags.transformations": {
                gift: this.id,
                state: "initial",
                hitDie,
                baseRollCount: message.rolls?.length ?? 0,
                presentedRoll: null
            }
        })

        void ChatMessagePartInjector

        await injectGiftOfDamnationCard({
            message,
            content: await this.renderCard({
                actor,
                message,
                state: "initial"
            })
        })
    }

    static getGiftRoll(message, rolls) {
        const baseRollCount =
                  message.flags?.transformations?.baseRollCount ?? 0

        return (rolls ?? message.rolls ?? []).slice(baseRollCount).at(-1) ?? null
    }

    static async getPresentedRoll(message, rolls) {
        const roll = this.getGiftRoll(message, rolls)
        if (roll) {
            return buildPresentedRollData(roll, {
                formula: message?.flags?.transformations?.rollFormula ?? null
            })
        }

        return message.flags?.transformations?.presentedRoll ?? null
    }

    static async complete(message, ChatMessagePartInjector, rolls) {
        void ChatMessagePartInjector
        void rolls

        await replaceGiftOfDamnationCard({
            GiftClass: this,
            message,
            content: await this.renderCard({
                actor: message?.speaker?.actor
                    ? game.actors.get(message.speaker.actor)
                    : null,
                message,
                state: "complete"
            })
        })

        await message.update({
            "flags.transformations.state": "complete"
        })
    }

    static getHighestAvailableHitDie(actor, actorRepository)
    {
        return getHighestAvailableHitDieDenomination(actor, actorRepository)
    }

    static getAvailableHitDice(actor, actorRepository)
    {
        const availableHitDice = actorRepository?.getAvailableHitDice?.(actor)
        if (Number.isFinite(availableHitDice)) return availableHitDice

        const classItems = actor?.items?.filter(item => item.type === "class") ?? []

        return classItems.reduce(
            (total, item) =>
                total + Math.max(Number(item.system?.hd?.value ?? 0), 0),
            0
        )
    }

    static async restoreSpellSlots(actor, selectedSpellSlots)
    {
        const slotSelections = selectedSpellSlots.reduce((acc, entry) =>
        {
            const slotKey = entry?.slotKey
            if (!slotKey) return acc

            acc[slotKey] = (acc[slotKey] ?? 0) + 1
            return acc
        }, {})

        const updates = {}

        for (const [slotKey, count] of Object.entries(slotSelections)) {
            const slot = actor.system?.spells?.[slotKey]
            const currentValue = Number(slot?.value ?? 0)
            const maxValue = this.getSpellSlotCapacity(slot)
            if (maxValue <= currentValue) continue

            updates[`system.spells.${slotKey}.value`] =
                Math.min(currentValue + count, maxValue)
        }

        if (Object.keys(updates).length === 0) return

        await actor.update(updates)
    }

    static getSpellSlotCapacity(slot)
    {
        if (!slot) return 0

        const rawOverride = slot.override
        if (rawOverride !== null && rawOverride !== undefined && rawOverride !== "") {
            const overrideValue = Number(rawOverride)
            return Number.isFinite(overrideValue)
                ? Math.max(overrideValue, 0)
                : 0
        }

        const maxValue = Number(slot.max ?? 0)
        return Number.isFinite(maxValue) ? Math.max(maxValue, 0) : 0
    }

    static async renderCard({
        actor,
        message,
        state,
        roll = null
    } = {})
    {
        const rollFormula = message?.flags?.transformations?.rollFormula ?? null
        const recoveryBudget =
                  Number(message?.flags?.transformations?.recoveryBudget ?? 0)

        return renderGiftOfDamnationCard({
            actor,
            message,
            GiftClass: this,
            state,
            subtitle: rollFormula
                ? `Spell Slot Budget Roll: ${rollFormula}`
                : "Spell Slot Budget Roll",
            supplements: this.buildSupplements({
                state,
                recoveryBudget
            }),
            buttons: this.buildButtons({state}),
            roll
        })
    }

    static buildButtons({
        state
    } = {})
    {
        if (state === "initial") {
            return [
                buildSyntheticActivityButton({
                    action: "roll",
                    label: "Roll"
                })
            ]
        }

        if (state === "rolled") {
            return [
                buildSyntheticActivityButton({
                    action: "recoverSpellSlots",
                    label: "Recover Spell Slots"
                })
            ]
        }

        return []
    }

    static buildSupplements({
        state,
        recoveryBudget
    } = {})
    {
        if (state === "rolled") {
            return [
                `You can recover up to <strong>${recoveryBudget}</strong> spell slot levels.`,
                `After recovery, you take Psychic damage equal to <strong>${recoveryBudget * 2}</strong>.`
            ]
        }

        if (state === "complete") {
            return ["Gift resolved."]
        }

        return ["Spend 2 Hit Dice to determine how many spell slot levels you can recover."]
    }
}
