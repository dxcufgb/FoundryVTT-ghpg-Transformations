import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"
import {
    buildPresentedRollData,
    buildSyntheticActivityButton,
    injectGiftOfDamnationCard,
    replaceGiftOfDamnationCard,
    renderGiftOfDamnationCard
} from "./GiftOfDamnationMidiCard.js"

export class GiftOfUnconditionalLove
{
    static id = "giftOfUnconditionalLove"
    static label = "Gift of Unconditional Love"
    static stage = 3
    static itemUuid = "Compendium.transformations.gh-transformations.Item.dCcsLmkAH6BjzBR7"
    static description = "When a creature you can see within 30 feet of you fails a saving throw, you can use your Reaction to gain Temporary Hit Points equal to 1d10 plus your Transformation Stage. You regain the use of this gift when you finish a Short or Long Rest.\n" +
        "\n" +
        "If you roll a 1 on the die, you gain no Temporary Hit Points and instead have the Prone condition."

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
            const stage =
                      message.flags?.transformations?.stage ??
                      actor.flags?.transformations?.stage ??
                      1
            const rollFormula = `1d10 + ${stage}`
            const roll = await RollService.simpleRoll(rollFormula)
            const messageRolls = [...(message.rolls ?? []), roll]
            const dieResult =
                      roll.dice?.[0]?.results?.find(result => result?.active === true)?.result ??
                      roll.total
            const success = dieResult >= 2
            const state = success ? "rolled-success" : "rolled-failure"
            const presentedRoll = await buildPresentedRollData(roll, {
                formula: rollFormula
            })

            await message.update({
                "flags.transformations.state": state,
                "flags.transformations.rollFormula": rollFormula,
                "flags.transformations.presentedRoll": presentedRoll
            })

            if (success) {
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
                return
            }

            await actor.toggleStatusEffect("prone", {active: true})
            await GiftClass.complete(message, ChatMessagePartInjector, messageRolls)
        },

        async applyTempHp({
            actor,
            message,
            element,
            actorRepository,
            ChatMessagePartInjector,
            GiftClass
        })
        {
            const amount = Number(element.dataset.tempHp ?? 0)

            await actorRepository.addTempHp(actor, amount)
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

    static async giftActivity({actor, message, ChatMessagePartInjector}) {
        const stage = actor.flags?.transformations?.stage ?? 1
        const rollFormula = `1d10 + ${stage}`

        await message.update({
            "flags.transformations": {
                gift: this.id,
                state: "initial",
                stage,
                baseRollCount: message.rolls?.length ?? 0,
                rollFormula,
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

    static async renderCard({
        actor,
        message,
        state,
        roll = null
    } = {})
    {
        const rollFormula = message?.flags?.transformations?.rollFormula ?? "1d10 + 1"
        const presentedRoll = message?.flags?.transformations?.presentedRoll ?? null
        const rollTotal = roll?.total ?? presentedRoll?.total ?? null

        return renderGiftOfDamnationCard({
            actor,
            message,
            GiftClass: this,
            state,
            subtitle: `Temporary Hit Points Roll: ${rollFormula}`,
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
                    action: "roll",
                    label: "Roll"
                })
            ]
        }

        if (state === "rolled-success") {
            return [
                buildSyntheticActivityButton({
                    action: "applyTempHp",
                    label: "Apply Temp HP",
                    dataset: {
                        tempHp: rollTotal ?? 0
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
            return [`Temporary Hit Points available: <strong>${rollTotal ?? 0}</strong>.`]
        }

        if (state === "rolled-failure") {
            return ["The die came up 1. You gain no Temporary Hit Points and instead become Prone."]
        }

        if (state === "complete") {
            return ["Gift resolved."]
        }

        return ["Roll to determine how many Temporary Hit Points you gain."]
    }
}
