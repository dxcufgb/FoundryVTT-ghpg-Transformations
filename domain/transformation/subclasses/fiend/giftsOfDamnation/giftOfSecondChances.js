import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

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
            const messageRolls = [...(message.rolls ?? []), roll]
            const success = roll.total >= 2
            const state = success ? "rolled-success" : "rolled-failure"
            const tooltip = await roll.getTooltip()

            await actorRepository.consumeHitDie(actor, 1)

            await message.update({
                rolls: messageRolls,
                "flags.transformations.state": state,
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
                    state,
                    roll: roll.total,
                    tooltip,
                    hitDie,
                    description: GiftClass.description
                }
            })

            if (success) return

            const currentFailures =
                      Number(actor.system?.attributes?.death?.failure ?? 0)

            await actorRepository.setActorDeathSaves(
                actor,
                currentFailures + 1,
                "failure"
            )

            await GiftClass.complete(message, ChatMessagePartInjector, messageRolls)
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
                hitDie,
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
        const hitDie = message.flags?.transformations?.hitDie

        await ChatMessagePartInjector.replaceCard({
            message,
            template:
                "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
            templateData: {
                giftId: this.id,
                state: "complete",
                roll: roll?.total,
                tooltip: roll?.tooltip ?? null,
                hitDie,
                description: this.description
            }
        })

        await message.update({
            "flags.transformations.state": "complete"
        })
    }
}
