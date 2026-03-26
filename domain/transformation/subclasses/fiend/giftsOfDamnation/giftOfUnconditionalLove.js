import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

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
            const tooltip = await roll.getTooltip()

            await message.update({
                rolls: messageRolls,
                "flags.transformations.state": state,
                "flags.transformations.rollFormula": rollFormula,
                "flags.transformations.presentedRoll": {
                    total: roll.total,
                    tooltip
                }
            })

            if (success) {
                await ChatMessagePartInjector.replaceCard({
                    message,
                    template:
                        "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
                    templateData: {
                        giftId: GiftClass.id,
                        state,
                        roll: roll.total,
                        tooltip,
                        rollFormula,
                        description: GiftClass.description
                    }
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
                rollFormula
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
                rollFormula,
                description: this.description
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
        const rollFormula = message.flags?.transformations?.rollFormula ?? "1d10 + 1"

        await ChatMessagePartInjector.replaceCard({
            message,
            template:
                "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
            templateData: {
                giftId: this.id,
                state: "complete",
                roll: roll?.total,
                tooltip: roll?.tooltip ?? null,
                rollFormula,
                description: this.description
            }
        })

        await message.update({
            "flags.transformations.state": "complete"
        })
    }
}
