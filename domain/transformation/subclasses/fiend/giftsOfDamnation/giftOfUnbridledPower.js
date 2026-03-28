import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

export class GiftOfUnbridledPower
{
    static id = "giftOfUnbridledPower"
    static label = "Gift of Unbridled Power"
    static stage = 4
    static itemUuid = "Compendium.transformations.gh-transformations.Item.x7OlLmg3FMTF0WSv"
    static description = "Placeholder effect for Gift of Unbridled Power."
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
            const tooltip = await roll.getTooltip()
            const messageRolls = [...(message.rolls ?? []), roll]

            await actorRepository.consumeHitDie(actor, 2)

            await message.update({
                rolls: messageRolls,
                "flags.transformations.state": "rolled",
                "flags.transformations.rollFormula": rollFormula,
                "flags.transformations.recoveryBudget": roll.total,
                "flags.transformations.presentedRoll": {
                    total: roll.total,
                    tooltip
                }
            })

            await ChatMessagePartInjector.replaceCard({
                message,
                template:
                    "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
                templateData: {
                    giftId: GiftClass.id,
                    state: "rolled",
                    roll: roll.total,
                    tooltip,
                    rollFormula
                }
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
                          amount: recoveryBudget
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
                baseRollCount: message.rolls?.length ?? 0
            }
        })

        await ChatMessagePartInjector.inject({
            message,
            template:
                "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
            templateData: {
                giftId: this.id,
                state: "initial",
                roll: null,
                tooltip: null,
                hitDie
            },
            selector: ".midi-buttons, .midi-dnd5e-buttons",
            position: "afterbegin"
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
            return {
                total: roll.total,
                tooltip: await roll.getTooltip()
            }
        }

        return message.flags?.transformations?.presentedRoll ?? null
    }

    static async complete(message, ChatMessagePartInjector, rolls) {
        const roll = await this.getPresentedRoll(message, rolls)
        const rollFormula = message.flags?.transformations?.rollFormula

        await ChatMessagePartInjector.replaceCard({
            message,
            template:
                "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
            templateData: {
                giftId: this.id,
                state: "complete",
                roll: roll?.total,
                tooltip: roll?.tooltip ?? null,
                rollFormula
            }
        })

        await message.update({
            "flags.transformations.state": "complete"
        })
    }

    static getHighestAvailableHitDie(actor, actorRepository)
    {
        const availableHitDie =
                  actorRepository?.getHighestAvailableHitDice?.(actor)?.denomination
        if (availableHitDie) return availableHitDie

        const classHitDice = actor?.items
            ?.filter(item => item.type === "class")
            ?.map(item => item.system?.hd?.denomination)
            ?.filter(Boolean) ?? []

        const sortedHitDice = [...classHitDice].sort((left, right) =>
            Number.parseInt(String(right).replace("d", "")) -
            Number.parseInt(String(left).replace("d", ""))
        )

        return sortedHitDice[0] ?? null
    }

    static getAvailableHitDice(actor, actorRepository)
    {
        const availableHitDice = actorRepository?.getAvailableHitDice?.(actor)
        if (Number.isFinite(availableHitDice)) return availableHitDice

        const classItems = actor?.items?.filter(item => item.type === "class") ?? []

        return classItems.reduce((total, item) =>
            total + Math.max(Number(item.system?.hd?.value ?? 0), 0),
        0)
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
}
