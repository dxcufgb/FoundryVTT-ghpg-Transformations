import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

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

        async roll({message, GiftClass, RollService, ChatMessagePartInjector}) {
            const roll = await RollService.simpleRoll("1d20")
            const success = roll.total >= 6
            const messageRolls = [...(message.rolls ?? []), roll]

            await message.update({
                rolls: messageRolls,
                "flags.transformations.rollFormula": "1d20",
                "flags.transformations.damageType": null,
                "flags.transformations.state":
                    success ? "complete" : "rolled-failure"
            })

            if (success) {
                await GiftClass.restoreItemUse(message)
                await GiftClass.complete(message, ChatMessagePartInjector, messageRolls)
                return
            }

            await ChatMessagePartInjector.replaceCard({
                message,
                template:
                    "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
                templateData: {
                    giftId: GiftClass.id,
                    state: "rolled-failure",
                    rolls: await GiftClass.getDisplayRolls({message, rolls: messageRolls})
                }
            })
        },

        async rollDamage({actor, message, GiftClass, RollService, ChatMessagePartInjector}) {
            const stage =
                      message.flags?.transformations?.stage ??
                      actor.flags?.transformations?.stage ??
                      1
            const rollFormula = `${stage}d6`
            const roll = await RollService.simpleRoll(`${rollFormula}[psychic]`)
            const messageRolls = [...(message.rolls ?? []), roll]
            roll.options ??= {}
            roll.options.type = "damage"
            roll.options.flavor = "Psychic"
            roll.options.types ??= []
            if (!roll.options.types.includes("psychic")) {
                roll.options.types.push("psychic")
            }
            
            await message.update({
                rolls: messageRolls,
                "flags.transformations.state": "damage-rolled",
                "flags.transformations.rollFormula": rollFormula,
                "flags.transformations.damageType": "Psychic"
            })

            await ChatMessagePartInjector.replaceCard({
                message,
                template:
                    "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
                templateData: {
                    giftId: GiftClass.id,
                    state: "damage-rolled",
                    rolls: await GiftClass.getDisplayRolls({message, rolls: messageRolls, stage})
                }
            })
        },

        async applyDamage({actor, message, GiftClass, ChatMessagePartInjector}) {
            const damageRoll = message.rolls?.at(-1)
            const damage = Number(damageRoll?.total ?? 0)
            const hp = actor.system.attributes.hp

            await actor.update({
                "system.attributes.hp.value": Math.max(hp.value - damage, 0)
            })

            await GiftClass.complete(message, ChatMessagePartInjector)
        }
    }

    static async giftActivity({actor, message, ChatMessagePartInjector}) {
        const stage = actor.flags?.transformations?.stage ?? 1

        await message.update({
            "flags.transformations": {
                gift: this.id,
                state: "initial",
                stage,
                baseRollCount: message.rolls?.length ?? 0,
                rollFormula: "1d20",
                damageType: null
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
                rollFormula: "1d20",
                damageType: null
            },
            selector: ".midi-buttons, .midi-dnd5e-buttons",
            position: "afterbegin"
        })
    }

    static getGiftRolls({message, rolls}) {
        const baseRollCount =
                  message.flags?.transformations?.baseRollCount ?? 0

        return (rolls ?? message.rolls ?? []).slice(baseRollCount)
    }

    static async getDisplayRolls({message, rolls, stage}) {
        const giftRolls = this.getGiftRolls({message, rolls})
        if (giftRolls.length === 0) return null

        const displayRolls = []
        const resolvedStage =
                  stage ??
                  message.flags?.transformations?.stage ??
                  1
        const [checkRoll, damageRoll] = giftRolls

        if (checkRoll) {
            displayRolls.push({
                total: checkRoll.total,
                tooltip: await checkRoll.getTooltip(),
                formula: "1d20",
                damageType: null
            })
        }

        if (damageRoll) {
            displayRolls.push({
                total: damageRoll.total,
                tooltip: await damageRoll.getTooltip(),
                formula: `${resolvedStage}d6`,
                damageType: "Psychic"
            })
        }

        return displayRolls
    }

    static async complete(message, ChatMessagePartInjector, rolls) {

        await ChatMessagePartInjector.replaceCard({
            message,
            template:
                "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
            templateData: {
                giftId: this.id,
                state: "complete",
                rolls: await this.getDisplayRolls({message, rolls})
            }
        })

        await message.update({
            "flags.transformations.state": "complete"
        })
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
}
