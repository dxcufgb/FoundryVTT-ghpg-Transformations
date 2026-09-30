import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"
import { getHighestAvailableHitDieDenomination } from "./getHighestAvailableHitDieDenomination.js"
import {
    buildPresentedRollData,
    buildSyntheticActivityButton,
    injectGiftOfDamnationCard,
    replaceGiftOfDamnationCard,
    renderGiftOfDamnationCard
} from "./GiftOfDamnationMidiCard.js"

export class GiftOfMartialProwess
{
    static id = "giftOfMartialProwess"
    static label = "Gift of Martial Prowess"
    static stage = 4
    static itemUuid = "Compendium.transformations.gh-transformations.Item.dZI20tO77HzlsSiP"
    static description = "Once per turn, when you miss with a weapon attack or Unarmed Strike, you can reroll the attack roll. If the reroll hits, you must spend 3 Hit Point Dice and add the result to the attack’s normal damage as Force damage. If the reroll misses, you must spend 3 Hit Point Dice and take Psychic damage equal to the result. If you have fewer than 3 Hit Point Dice available, you cannot use this gift.\n" +
        "\n" +
        "Once you hit a target with an attack using a rerolled attack, you cannot use it again until you finish a Long Rest."
    static hitDiceCost = 3
    static lastAttackRolls = new Map()
    static resolvingMessages = new Set()
    static actions = {

        async attack({
            actor,
            message,
            GiftClass,
            RollService,
            ChatMessagePartInjector
        })
        {
            const attackFormula =
                      GiftClass.getLastAttackFormula(actor) ??
                      message.flags?.transformations?.attackFormula ??
                      "1d20"
            const roll = await RollService.simpleRoll(attackFormula)
            const presentedRolls = {
                ...(message.flags?.transformations?.presentedRolls ?? {}),
                attack: await buildPresentedRollData(roll, {
                    formula: attackFormula,
                    slot: "attack"
                })
            }

            await message.update({
                "flags.transformations.state": "attack-rolled",
                "flags.transformations.attackFormula": attackFormula,
                "flags.transformations.presentedRolls": presentedRolls
            })

            void ChatMessagePartInjector

            await replaceGiftOfDamnationCard({
                GiftClass,
                message,
                content: await GiftClass.renderCard({
                    actor,
                    message,
                    state: "attack-rolled",
                    presentedRolls
                })
            })
        },

        async rollHitDamage(options)
        {
            await options.GiftClass.resolveReroll({
                ...options,
                outcome: "hit"
            })
        },

        async rollMissDamage(options)
        {
            await options.GiftClass.resolveReroll({
                ...options,
                outcome: "miss"
            })
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
        if (!this.canUse(actor, message, actorRepository)) return

        const hitDie = this.getActorHitDie(actor, actorRepository)
        const attackFormula = this.getLastAttackFormula(actor) ?? "1d20"

        await message.update({
            "flags.transformations": {
                gift: this.id,
                state: "initial",
                hitDie,
                attackFormula,
                presentedRolls: null
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

    static async resolveReroll({
        actor,
        message,
        actorRepository,
        GiftClass,
        RollService,
        ChatMessagePartInjector,
        outcome
    })
    {
        if (message.flags?.transformations?.state !== "attack-rolled") return
        // Guard against a double click resolving the reroll (and spending Hit Dice) twice
        if (GiftClass.resolvingMessages.has(message.id)) return

        if (GiftClass.getAvailableHitDice(actor, actorRepository) < GiftClass.hitDiceCost) {
            ui.notifications?.warn?.(
                `${GiftClass.label}: you need at least ${GiftClass.hitDiceCost} Hit Point Dice.`
            )
            return
        }

        GiftClass.resolvingMessages.add(message.id)
        try {
            await GiftClass.completeReroll({
                actor,
                message,
                actorRepository,
                GiftClass,
                RollService,
                ChatMessagePartInjector,
                outcome
            })
        } finally {
            GiftClass.resolvingMessages.delete(message.id)
        }
    }

    static async completeReroll({
        actor,
        message,
        actorRepository,
        GiftClass,
        RollService,
        ChatMessagePartInjector,
        outcome
    })
    {

        const hitDie =
                  message.flags?.transformations?.hitDie ??
                  GiftClass.getActorHitDie(actor, actorRepository)
        const rollFormula = `${GiftClass.hitDiceCost}${hitDie}`
        const damageType = outcome === "hit" ? "Force" : "Psychic"
        const roll = await RollService.simpleRoll(rollFormula)
        const presentedRolls = {
            ...(message.flags?.transformations?.presentedRolls ?? {}),
            damage: await buildPresentedRollData(roll, {
                formula: rollFormula,
                damageType,
                slot: "damage"
            })
        }

        await actorRepository.consumeHitDie(actor, GiftClass.hitDiceCost)

        if (outcome === "miss") {
            const psychicDamage = Number(roll.total ?? 0)
            if (psychicDamage > 0) {
                // Goes through dnd5e so Temporary Hit Points and Psychic
                // resistance or immunity are respected
                await actor.applyDamage([{
                    value: psychicDamage,
                    type: "psychic"
                }])
            }
        } else {
            // A hit with the rerolled attack locks the gift until a Long Rest
            await GiftClass.spendItemUse(actor, message)
        }

        await message.update({
            "flags.transformations.state": "complete",
            "flags.transformations.outcome": outcome,
            "flags.transformations.hitDie": hitDie,
            "flags.transformations.damageRollFormula": rollFormula,
            "flags.transformations.presentedRolls": presentedRolls
        })

        void ChatMessagePartInjector

        await replaceGiftOfDamnationCard({
            GiftClass,
            message,
            content: await GiftClass.renderCard({
                actor,
                message,
                state: "complete",
                presentedRolls
            })
        })
    }

    static canUse(actor, message, actorRepository)
    {
        if (this.getAvailableHitDice(actor, actorRepository) < this.hitDiceCost) {
            ui.notifications?.warn?.(
                `${this.label}: you need at least ${this.hitDiceCost} Hit Point Dice.`
            )
            return false
        }

        const item = this.getGiftItem(actor, message)
        if (item && this.getRemainingUses(item) <= 0) {
            ui.notifications?.warn?.(
                `${this.label} can't be used again until you finish a Long Rest.`
            )
            return false
        }

        return true
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

    static getGiftItem(actor, message)
    {
        const itemUuid = message?.flags?.dnd5e?.item?.uuid
        const items = actor?.items

        return (itemUuid ? items?.find(item => item.uuid === itemUuid) : null) ??
            items?.find(item => item.name === this.label) ??
            null
    }

    static getRemainingUses(item)
    {
        const maxUses = Number.parseInt(item?.system?.uses?.max)
        if (!Number.isFinite(maxUses) || maxUses <= 0) return Infinity

        return maxUses - (Number(item.system?.uses?.spent) || 0)
    }

    static async spendItemUse(actor, message)
    {
        const item = this.getGiftItem(actor, message)
        if (!item) return

        const maxUses = Number.parseInt(item.system?.uses?.max)
        if (!Number.isFinite(maxUses) || maxUses <= 0) return

        await item.update({
            "system.uses.spent": maxUses
        })
    }

    static rememberAttackRoll(actor, rollContext = {})
    {
        const roll = rollContext?.roll ?? rollContext
        const formula = this.resolveAttackFormula(roll)
        const actorKey = actor?.uuid ?? actor?.id ?? null

        if (!actorKey || !formula) return

        this.lastAttackRolls.set(actorKey, {
            formula
        })
    }

    static getLastAttackFormula(actor)
    {
        const actorKey = actor?.uuid ?? actor?.id ?? null
        if (!actorKey) return null

        return this.lastAttackRolls.get(actorKey)?.formula ?? null
    }

    static resolveAttackFormula(roll)
    {
        const formula = String(roll?.formula ?? "").trim()
        if (!formula || formula.includes("@")) return null

        return formula
    }

    static getActorHitDie(actor, actorRepository)
    {
        return getHighestAvailableHitDieDenomination(actor, actorRepository) ?? "d6"
    }

    static async renderCard({
        actor,
        message,
        state,
        presentedRolls = null
    } = {})
    {
        const attackFormula = message?.flags?.transformations?.attackFormula ?? "1d20"
        const hitDie = message?.flags?.transformations?.hitDie ?? "d6"
        const resolvedPresentedRolls =
                  presentedRolls ??
                  message?.flags?.transformations?.presentedRolls ??
                  null

        return renderGiftOfDamnationCard({
            actor,
            message,
            GiftClass: this,
            state,
            subtitle: `Reroll Attack: ${attackFormula} | Hit Dice Cost: 3${hitDie}`,
            supplements: this.buildSupplements({
                state,
                outcome: message?.flags?.transformations?.outcome ?? null,
                attackTotal: resolvedPresentedRolls?.attack?.total ?? null,
                damageTotal: resolvedPresentedRolls?.damage?.total ?? null
            }),
            buttons: this.buildButtons({state}),
            presentedRolls: resolvedPresentedRolls
        })
    }

    static buildButtons({
        state
    } = {})
    {
        if (state === "initial") {
            return [
                buildSyntheticActivityButton({
                    action: "attack",
                    label: "Attack"
                })
            ]
        }

        if (state === "attack-rolled") {
            return [
                buildSyntheticActivityButton({
                    action: "rollHitDamage",
                    label: "Hit: Roll Force Damage"
                }),
                buildSyntheticActivityButton({
                    action: "rollMissDamage",
                    label: "Miss: Take Psychic Damage"
                })
            ]
        }

        return []
    }

    static buildSupplements({
        state,
        outcome = null,
        attackTotal,
        damageTotal
    } = {})
    {
        if (state === "attack-rolled") {
            return [
                `Attack reroll total: <strong>${attackTotal ?? 0}</strong>.`,
                "Either way you spend 3 Hit Dice. On a hit, add the roll as Force damage and the gift is spent until a Long Rest. On a miss, you take the roll as Psychic damage."
            ]
        }

        if (state === "complete" && outcome === "hit") {
            return [
                `Hit Dice roll total: <strong>${damageTotal ?? 0}</strong>.`,
                "Add this to the attack's damage as Force damage. You can't use this gift again until you finish a Long Rest."
            ]
        }

        if (state === "complete" && outcome === "miss") {
            return [
                `Hit Dice roll total: <strong>${damageTotal ?? 0}</strong>.`,
                "You took this much Psychic damage."
            ]
        }

        if (state === "complete") {
            return [
                `Hit Dice roll total: <strong>${damageTotal ?? 0}</strong>.`,
                "Apply the rolled total as Force damage on a hit, or Psychic damage to yourself on a miss."
            ]
        }

        return ["Reroll the triggering attack. After the reroll, spend 3 Hit Dice to determine the outcome."]
    }
}
