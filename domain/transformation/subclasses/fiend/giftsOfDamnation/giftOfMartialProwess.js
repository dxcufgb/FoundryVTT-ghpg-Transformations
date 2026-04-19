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
    static lastAttackRolls = new Map()
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

        async rollDamage({
            actor,
            message,
            actorRepository,
            GiftClass,
            RollService,
            ChatMessagePartInjector
        })
        {
            const hitDie =
                      message.flags?.transformations?.hitDie ??
                      GiftClass.getActorHitDie(actor, actorRepository)
            const rollFormula = `3${hitDie}`
            const roll = await RollService.simpleRoll(rollFormula)
            const presentedRolls = {
                ...(message.flags?.transformations?.presentedRolls ?? {}),
                damage: await buildPresentedRollData(roll, {
                    formula: rollFormula,
                    slot: "damage"
                })
            }

            await message.update({
                "flags.transformations.state": "complete",
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
                    action: "rollDamage",
                    label: "Roll Damage"
                })
            ]
        }

        return []
    }

    static buildSupplements({
        state,
        attackTotal,
        damageTotal
    } = {})
    {
        if (state === "attack-rolled") {
            return [
                `Attack reroll total: <strong>${attackTotal ?? 0}</strong>.`,
                "If the reroll hits, add the next roll as Force damage. If it misses, take the next roll as Psychic damage."
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
