import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"
import {
    buildPresentedRollData,
    buildSyntheticActivityButton,
    injectGiftOfDamnationCard,
    replaceGiftOfDamnationCard,
    renderGiftOfDamnationCard
} from "./GiftOfDamnationMidiCard.js"

export class GiftOfJoyousLife
{
    static id = "giftOfJoyousLife"
    static label = "Gift of Joyous Life"
    static itemUuid = "Compendium.transformations.gh-transformations.Item.zzXZ3tex07ScSN5L"
    static stage = 1
    static description = "At the beginning of your turn, if you are Bloodied, you can choose to roll a Hit Point Die (no action required) and regain a number of Hit Points equal to the roll. If you roll a 1 on this die, you regain no Hit points and take 1 point of Force damage instead. You regain this ability when you finish a Short or Long Rest."
    static actions = {

        async rollHitDie({actor, message, actorRepository, RollService, ChatMessagePartInjector}) {
            const itemUuid = message.flags?.dnd5e?.item?.uuid
            if (itemUuid) {
                const item = await fromUuid(itemUuid)

                const uses = item?.system?.uses

                if (uses?.value > 0) {
                    await item.update({
                        "system.uses.value": uses.value - 1,
                        "system.uses.spent": uses.spent + 1
                    })
                }
            }
            const hitDie = message.flags?.transformations?.hitDie
            const roll = await RollService.simpleRoll(hitDie)
            const presentedRoll = await buildPresentedRollData(roll, {
                formula: hitDie
            })

            await actorRepository.consumeHitDie(actor, 1)

            await message.update({
                "flags.transformations.state": roll.total >= 2
                    ? "rolled-success"
                    : "rolled-failure",
                "flags.transformations.presentedRoll": presentedRoll
            })

            void ChatMessagePartInjector

            await replaceGiftOfDamnationCard({
                GiftClass: GiftOfJoyousLife,
                message,
                content: await GiftOfJoyousLife.renderCard({
                    actor,
                    message,
                    state: roll.total >= 2
                        ? "rolled-success"
                        : "rolled-failure",
                    roll
                })
            })
        },

        async applyHealing({actor, message, element, GiftClass, actorRepository, ChatMessagePartInjector}) {

            const heal = Number(element.dataset.healing)

            const hp = actor.system.attributes.hp

            await actor.update({
                "system.attributes.hp.value":
                    Math.min(hp.value + heal, hp.max)
            })

            await GiftClass.complete(message, ChatMessagePartInjector)
        },

        async applyDamage({actor, message, GiftClass, ChatMessagePartInjector}) {
            const hasForceImmunity = actor.system.traits.di.value.has("force")
            const hasForceResistance = actor.system.traits.dr.value.has("force")
            if (!hasForceImmunity) {
                const hp = actor.system.attributes.hp

                await actor.update({
                    "system.attributes.hp.value": Math.max(hp.value - 1, 0)
                })
            }

            await GiftClass.complete(message, ChatMessagePartInjector)
        }

    }

    static async apply({actor, itemRepository, actorRepository}) {
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

    static async giftActivity({actor, message, actorRepository, ChatMessagePartInjector}) {
        const isBloodied = actor.system.attributes.hp.value < actor.system.attributes.hp.max / 2
        const itemUuid = message.flags?.dnd5e?.item?.uuid
        let remainingUses = 0
        if (itemUuid) {
            const item = await fromUuid(itemUuid)
            remainingUses = item.system?.uses?.value
        }
        if (isBloodied && remainingUses > 0) {
            const hitDie = actorRepository.getHighestAvailableHitDice(actor).denomination

            await message.update({
                "flags.transformations": {
                    gift: this.id,
                    state: "initial",
                    hitDie,
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
    }

    static async complete(message, ChatMessagePartInjector) {
        void ChatMessagePartInjector

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

    static async renderCard({
        actor,
        message,
        state,
        roll = null
    } = {})
    {
        const hitDie = message?.flags?.transformations?.hitDie ?? "d6"
        const presentedRoll = message?.flags?.transformations?.presentedRoll ?? null
        const rollTotal = roll?.total ?? presentedRoll?.total ?? null

        return renderGiftOfDamnationCard({
            actor,
            message,
            GiftClass: this,
            state,
            subtitle: `Hit Die: ${hitDie}`,
            supplements: this.buildSupplements({
                state,
                rollTotal
            }),
            buttons: this.buildButtons({
                state,
                rollTotal
            }),
            roll
        })
    }

    static buildButtons({
        state,
        rollTotal
    } = {})
    {
        if (state === "initial") {
            return [
                buildSyntheticActivityButton({
                    action: "rollHitDie",
                    label: "Roll Hit Die"
                })
            ]
        }

        if (state === "rolled-success") {
            return [
                buildSyntheticActivityButton({
                    action: "applyHealing",
                    label: "Apply Healing",
                    dataset: {
                        healing: rollTotal ?? 0
                    }
                })
            ]
        }

        if (state === "rolled-failure") {
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
        rollTotal
    } = {})
    {
        if (state === "rolled-success") {
            return [`Healing available: <strong>${rollTotal ?? 0}</strong>.`]
        }

        if (state === "rolled-failure") {
            return ["The die came up 1. You regain no hit points and take 1 force damage instead."]
        }

        if (state === "complete") {
            return ["Gift resolved."]
        }

        return ["Roll one Hit Die to determine the outcome."]
    }
}
