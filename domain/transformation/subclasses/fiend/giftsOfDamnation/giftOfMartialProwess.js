import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"
import { getHighestAvailableHitDieDenomination } from "./getHighestAvailableHitDieDenomination.js"

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
            const messageRolls = [...(message.rolls ?? []), roll]
            const displayRolls = await GiftClass.getDisplayRolls({
                message,
                rolls: messageRolls,
                attackFormula
            })

            await message.update({
                rolls: messageRolls,
                "flags.transformations.state": "attack-rolled",
                "flags.transformations.attackFormula": attackFormula,
                "flags.transformations.presentedRolls": displayRolls
            })

            await ChatMessagePartInjector.replaceCard({
                message,
                template:
                    "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
                templateData: {
                    giftId: GiftClass.id,
                    state: "attack-rolled",
                    rolls: displayRolls
                }
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
            const messageRolls = [...(message.rolls ?? []), roll]
            const displayRolls = await GiftClass.getDisplayRolls({
                message,
                rolls: messageRolls,
                hitDie
            })

            await message.update({
                rolls: messageRolls,
                "flags.transformations.state": "complete",
                "flags.transformations.hitDie": hitDie,
                "flags.transformations.damageRollFormula": rollFormula,
                "flags.transformations.presentedRolls": displayRolls
            })

            await ChatMessagePartInjector.replaceCard({
                message,
                template:
                    "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
                templateData: {
                    giftId: GiftClass.id,
                    state: "complete",
                    rolls: displayRolls
                }
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
                baseRollCount: message.rolls?.length ?? 0
            }
        })

        await ChatMessagePartInjector.inject({
            message,
            template:
                "modules/transformations/scripts/templates/chatMessages/gifts-of-damnation-chat-card.hbs",
            templateData: {
                giftId: this.id,
                state: "initial"
            },
            selector: ".midi-buttons, .midi-dnd5e-buttons",
            position: "afterbegin"
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

    static getGiftRolls({message, rolls})
    {
        const baseRollCount =
                  message.flags?.transformations?.baseRollCount ?? 0

        return (rolls ?? message.rolls ?? []).slice(baseRollCount)
    }

    static async getDisplayRolls({
        message,
        rolls,
        hitDie,
        attackFormula: selectedAttackFormula
    })
    {
        const giftRolls = this.getGiftRolls({
            message,
            rolls
        })

        if (giftRolls.length === 0) {
            return message.flags?.transformations?.presentedRolls ?? null
        }

        const attackFormula =
                  selectedAttackFormula ??
                  message.flags?.transformations?.attackFormula ??
                  this.resolveAttackFormula(giftRolls[0]) ??
                  "1d20"
        const resolvedHitDie =
                  hitDie ??
                  message.flags?.transformations?.hitDie ??
                  "d6"
        const damageRollFormula =
                  message.flags?.transformations?.damageRollFormula ??
                  `3${resolvedHitDie}`
        const displayRolls = []
        const [attackRoll, damageRoll] = giftRolls

        if (attackRoll) {
            displayRolls.push({
                total: attackRoll.total,
                tooltip: await attackRoll.getTooltip(),
                formula: attackFormula
            })
        }

        if (damageRoll) {
            displayRolls.push({
                total: damageRoll.total,
                tooltip: await damageRoll.getTooltip(),
                formula: damageRollFormula
            })
        }

        return displayRolls
    }
}
