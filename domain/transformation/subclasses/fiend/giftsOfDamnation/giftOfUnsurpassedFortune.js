import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"
import {
    buildPresentedRollData,
    buildSyntheticActivityButton,
    injectGiftOfDamnationCard,
    replaceGiftOfDamnationCard,
    renderGiftOfDamnationCard
} from "./GiftOfDamnationMidiCard.js"

export class GiftOfUnsurpassedFortune
{
    static id = "giftOfUnsurpassedFortune"
    static label = "Gift of Unsurpassed Fortune"
    static itemUuid = "Compendium.transformations.gh-transformations.Item.97GBQgFFed1p1vMJ"
    static stage = 1
    static description = "When an enemy you can see within 10 feet succeeds on an attack roll or a saving throw, you can use your Reaction to roll d20. On a 6 or higher, the triggering attack or save misses or fails, and you regain the use of your Reaction. Otherwise, you take 1d6 Psychic damage per Transformation Stage, which cannot be reduced. You regain your use of this ability when you finish a Long Rest."

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

    static actions = {

        async roll({
            actor,
            message,
            GiftClass,
            RollService,
            ChatMessagePartInjector
        })
        {
            const roll = await RollService.simpleRoll("1d20")
            const success = roll.total >= 6
            const presentedRolls = {
                ...(message.flags?.transformations?.presentedRolls ?? {}),
                attack: await buildPresentedRollData(roll, {
                    formula: "1d20",
                    slot: "attack"
                })
            }

            await message.update({
                "flags.transformations.rollFormula": "1d20",
                "flags.transformations.damageType": null,
                "flags.transformations.presentedRolls": presentedRolls,
                "flags.transformations.state":
                    success ? "complete" : "rolled-failure"
            })

            if (success) {
                await GiftClass.restoreItemUse(message)
                await GiftClass.complete(message, ChatMessagePartInjector, {
                    actor,
                    presentedRolls
                })
                return
            }

            void ChatMessagePartInjector

            await replaceGiftOfDamnationCard({
                GiftClass,
                message,
                content: await GiftClass.renderCard({
                    actor,
                    message,
                    state: "rolled-failure",
                    presentedRolls
                })
            })
        },

        async rollDamage({
            actor,
            message,
            GiftClass,
            RollService,
            ChatMessagePartInjector
        })
        {
            const stage =
                      message.flags?.transformations?.stage ??
                      actor.flags?.transformations?.stage ??
                      1
            const rollFormula = `${stage}d6`
            const roll = await RollService.simpleRoll(`${rollFormula}[psychic]`)
            roll.options ??= {}
            roll.options.type = "damage"
            roll.options.flavor = "Psychic"
            roll.options.types ??= []
            if (!roll.options.types.includes("psychic")) {
                roll.options.types.push("psychic")
            }
            const presentedRolls = {
                ...(message.flags?.transformations?.presentedRolls ?? {}),
                damage: await buildPresentedRollData(roll, {
                    formula: rollFormula,
                    damageType: "Psychic",
                    slot: "damage"
                })
            }
            
            await message.update({
                "flags.transformations.state": "damage-rolled",
                "flags.transformations.rollFormula": rollFormula,
                "flags.transformations.damageType": "Psychic",
                "flags.transformations.presentedRolls": presentedRolls
            })

            void stage
            void ChatMessagePartInjector

            await replaceGiftOfDamnationCard({
                GiftClass,
                message,
                content: await GiftClass.renderCard({
                    actor,
                    message,
                    state: "damage-rolled",
                    presentedRolls
                })
            })
        },

        async applyDamage({actor, message, GiftClass, ChatMessagePartInjector}) {
            const damage =
                      Number(
                          message.flags?.transformations?.presentedRolls?.damage?.total ??
                          0
                      )
            const hp = actor.system.attributes.hp

            await actor.update({
                "system.attributes.hp.value": Math.max(hp.value - damage, 0)
            })

            await GiftClass.complete(message, ChatMessagePartInjector, {
                actor
            })
        }
    }

    static async giftActivity({actor, message, ChatMessagePartInjector}) {
        const stage = actor.flags?.transformations?.stage ?? 1

        await message.update({
            "flags.transformations": {
                gift: this.id,
                state: "initial",
                stage,
                rollFormula: "1d20",
                damageType: null,
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

    static async complete(
        message,
        ChatMessagePartInjector,
        {
            actor = null,
            presentedRolls = null
        } = {}
    )
    {
        void ChatMessagePartInjector

        const resolvedActor =
                  actor ??
                  (message?.speaker?.actor
                      ? game.actors.get(message.speaker.actor)
                      : null)
        const updates = {
            "flags.transformations.state": "complete"
        }

        if (presentedRolls) {
            updates["flags.transformations.presentedRolls"] = presentedRolls
        }

        await replaceGiftOfDamnationCard({
            GiftClass: this,
            message,
            content: await this.renderCard({
                actor: resolvedActor,
                message,
                state: "complete",
                presentedRolls
            })
        })

        await message.update(updates)
    }

    static async restoreItemUse(message) {
        const itemUuid = message.flags?.dnd5e?.item?.uuid
        if (!itemUuid) return

        const item = await fromUuid(itemUuid)
        if (!item) return

        const uses = item.system?.uses
        if (!uses) return

        const currentValue = Number(uses.value) || 0
        const currentSpent = Number(uses.spent) || 0
        const maxUses = Number(uses.max)

        await item.update({
            "system.uses.value":
                Number.isFinite(maxUses)
                    ? Math.min(currentValue + 1, maxUses)
                    : currentValue + 1,
            "system.uses.spent": Math.max(currentSpent - 1, 0)
        })
    }

    static async renderCard({
        actor,
        message,
        state,
        presentedRolls = null
    } = {})
    {
        const stage = message?.flags?.transformations?.stage ?? 1
        const resolvedPresentedRolls =
                  presentedRolls ??
                  message?.flags?.transformations?.presentedRolls ??
                  null

        return renderGiftOfDamnationCard({
            actor,
            message,
            GiftClass: this,
            state,
            subtitle: `Check: 1d20 | Psychic Damage: ${stage}d6`,
            supplements: this.buildSupplements({
                state,
                stage,
                checkTotal: resolvedPresentedRolls?.attack?.total ?? null,
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
                    action: "roll",
                    label: "Roll"
                })
            ]
        }

        if (state === "rolled-failure") {
            return [
                buildSyntheticActivityButton({
                    action: "rollDamage",
                    label: "Roll Damage"
                })
            ]
        }

        if (state === "damage-rolled") {
            return [
                buildSyntheticActivityButton({
                    action: "applyDamage",
                    label: "Apply Damage"
                })
            ]
        }

        return []
    }

    static buildSupplements({
        state,
        stage,
        checkTotal,
        damageTotal
    } = {})
    {
        if (state === "rolled-failure") {
            return [
                `Check result: <strong>${checkTotal ?? 0}</strong>.`,
                `The roll failed. Roll <strong>${stage}d6</strong> Psychic damage.`
            ]
        }

        if (state === "damage-rolled") {
            return [
                `Check result: <strong>${checkTotal ?? 0}</strong>.`,
                `Psychic damage to apply: <strong>${damageTotal ?? 0}</strong>.`
            ]
        }

        if (state === "complete" && Number(checkTotal ?? 0) >= 6) {
            return [
                `Check result: <strong>${checkTotal ?? 0}</strong>.`,
                "The triggering attack or saving throw fails, and you regain your Reaction."
            ]
        }

        if (state === "complete" && damageTotal != null) {
            return [
                `Check result: <strong>${checkTotal ?? 0}</strong>.`,
                `Psychic damage resolved: <strong>${damageTotal ?? 0}</strong>.`
            ]
        }

        return ["Roll 1d20. On a 6 or higher, the triggering attack or save fails and you keep your Reaction."]
    }
}
