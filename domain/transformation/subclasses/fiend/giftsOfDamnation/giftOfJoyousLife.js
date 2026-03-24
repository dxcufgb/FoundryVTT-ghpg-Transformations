import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

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

            await actorRepository.consumeHitDie(actor, 1)

            await message.update({
                rolls: [...(message.rolls ?? []), roll]
            })

            const success = roll.total >= 2
            const state = success ? "rolled-success" : "rolled-failure"

            await ChatMessagePartInjector.replace({
                message,
                selector: ".gift-of-damnation-card",
                template: "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
                templateData: {
                    giftId: GiftOfJoyousLife.id,
                    state: state,
                    roll: roll.total,
                    tooltip: await roll.getTooltip(),
                    hitDie: hitDie
                }
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
                    hitDie
                }
            })

            await ChatMessagePartInjector.inject({
                message,
                template: "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
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
    }

    static async complete(message, ChatMessagePartInjector) {

        const roll = message.rolls?.at(-1)

        const hitDie = message.flags?.transformations?.hitDie

        await ChatMessagePartInjector.replaceCard({
            message,
            template: "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
            templateData: {
                giftId: this.id,
                state: "complete",
                roll: roll?.total,
                tooltip: roll ? await roll.getTooltip() : null,
                hitDie
            }
        })

        await message.update({
            "flags.transformations.state": "complete"
        })
    }
}
