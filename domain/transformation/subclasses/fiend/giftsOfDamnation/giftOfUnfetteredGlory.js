import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

export class GiftOfUnfetteredGlory
{
    static id = "giftOfUnfetteredGlory"
    static label = "Gift of Unfettered Glory"
    static stage = 5
    static description = "Placeholder effect for Gift of Unfettered Glory."

    static async apply({actor, itemRepository}) {
        return applyGiftOfDamnation({
            actor,
            giftClass: this,
            itemRepository,
            changes: []
        })
    }
}
