import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

export class GiftOfLiberatingFreedom
{
    static id = "giftOfLiberatingFreedom"
    static label = "Gift of Liberating Freedom"
    static stage = 2
    static description = "As a Bonus Action while aren't wearing Heavy armor, you can manifest a pair of leathery wings. You gain a Fly Speed equal to half your Speed. These wings recede if you dismiss them as a Bonus Action on your turn, if you have the Unconscious condition, or if you become Bloodied while they are manifested.\n" +
        "\n" +
        "You can have your wing manifested for 1 hour total, including several shorter stints adding up to 1 hour. You regain your ability to use your wings for an hour after finishing a Long Rest."
    static itemUuid = "Compendium.transformations.gh-transformations.Item.KdqNhneTuvIeJZJn"

    static async apply({actor, actorRepository, itemRepository}) {
        const sourceItem = this.itemUuid
            ? await fromUuid(this.itemUuid)
            : null

        const actorFlySpeed = ((actor.system.attributes.movement.walk - parseInt(actor.system.attributes.movement.bonus) ?? 0) / 2)
        const actorOriginalFlySpeed = actor.system.attributes.movement.fly ?? 0
        const giftItem = await applyGiftOfDamnation({
            actor,
            giftClass: this,
            itemRepository,
            actorRepository,
            sourceItem,
            flagData: {
                actorOriginalFlySpeed: actorOriginalFlySpeed,
                actorFlySpeed: actorFlySpeed
            }
        })
        const createdItem = actor.items.find(i => i.name == "Gift of Liberating Freedom")
        const activity = createdItem.system.activities.find(a => a.name == "Manifest Wings")
        const effect = activity.effects.find(e => e.effect.name == "Manifested Wings")
        await effect.effect.update({
            changes: [{
                key: "system.attributes.movement.fly",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: actorFlySpeed
            }],
            description: `Your wings give you ${actorFlySpeed} ft Fly Speed.`
        })
    }
}
