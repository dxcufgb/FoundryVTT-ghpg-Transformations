import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

export class GiftOfUnfetteredGlory
{
    static id = "giftOfUnfetteredGlory"
    static label = "Gift of Unfettered Glory"
    static stage = 2
    static itemUuid = "Compendium.transformations.gh-transformations.Item.RyzgJyXTAcpO0hRn"
    static description = "Each time you damage a creature with a melee attack, an Unarmed Strike, or a cantrip, you can do an additional 2 points Force Damage per Transformation Stage.\n" +
        "\n" +
        "Each time you roll a Hit Point Die to regain Hit Points during a Short Rest, you regain 2 Hit Points fewer per Hit Die."

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
            changes: [],
            flagData: {
                hitDieModifier: 0
            }
        })
    }
}
