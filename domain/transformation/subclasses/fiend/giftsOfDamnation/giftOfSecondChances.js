import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"
import {
    buildPresentedRollData,
    buildSyntheticActivityButton,
    injectGiftOfDamnationCard,
    replaceGiftOfDamnationCard,
    renderGiftOfDamnationCard
} from "./GiftOfDamnationMidiCard.js"

export class GiftOfSecondChances
{
    static id = "giftOfSecondChances"
    static label = "Gift of Second Chances"
    static stage = 3
    static itemUuid = "Compendium.transformations.gh-transformations.Item.AffPa4GzgJmt6CQy"
    static description = "When you are reduced to 0 Hit Points, you can use your Reaction to roll a Hit Point Die. If you roll a 2 or better, set your Hit Point total to the result of the roll. If not, you suffer a Death Saving Throw failure. You regain the use of this gift when you finish a Long Rest."

    static actions = {

        async rollHitDie({
            actor,
            message,
            actorRepository,
            RollService,
            ChatMessagePartInjector,
            GiftClass
        })
        {
            const hitDie = message.flags?.transformations?.hitDie
            if (!hitDie) return

            const roll = await RollService.simpleRoll(hitDie)
            const success = roll.total >= 2
            const state = success ? "rolled-success" : "rolled-failure"
            const presentedRoll = await buildPresentedRollData(roll, {
                formula: hitDie
            })

            await actorRepository.consumeHitDie(actor, 1)

            await message.update({
                "flags.transformations.state": state,
                "flags.transformations.presentedRoll": presentedRoll
            })

            void ChatMessagePartInjector

            await replaceGiftOfDamnationCard({
                GiftClass,
                message,
                content: await GiftClass.renderCard({
                    actor,
                    message,
                    state,
                    roll
                })
            })

            if (success) return

            const currentFailures =
                      Number(actor.system?.attributes?.death?.failure ?? 0)

            await actorRepository.setActorDeathSaves(
                actor,
                currentFailures + 1,
                "failure"
            )

            await GiftClass.complete(message, ChatMessagePartInjector)
        },

        async applyHealing({
            actor,
            message,
            element,
            actorRepository,
            ChatMessagePartInjector,
            GiftClass
        })
        {
            const healing = Number(element.dataset.healing ?? 0)

            await actorRepository.setActorHp(actor, healing)
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

    static async giftActivity({actor, message, actorRepository, ChatMessagePartInjector}) {
        const hitDie =
                  actorRepository.getHighestAvailableHitDice(actor)?.denomination ?? null

        if (!hitDie) return

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
                formula: message?.flags?.transformations?.hitDie ?? null
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

        return []
    }

    static buildSupplements({
        state,
        rollTotal
    } = {})
    {
        if (state === "rolled-success") {
            return [`Set your hit points to <strong>${rollTotal ?? 0}</strong>.`]
        }

        if (state === "rolled-failure") {
            return ["The die came up 1. You suffer a Death Saving Throw failure."]
        }

        if (state === "complete") {
            return ["Gift resolved."]
        }

        return ["Roll one Hit Die to determine whether you recover or fail."]
    }
}
