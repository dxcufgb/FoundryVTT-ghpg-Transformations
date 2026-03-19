import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

export class GiftOfLiberatingFreedom
{
    static id = "giftOfLiberatingFreedom"
    static label = "Gift of Liberating Freedom"
    static stage = 4
    static description = "Placeholder effect for Gift of Liberating Freedom."

    static async apply({actor, itemRepository}) {
        return applyGiftOfDamnation({
            actor,
            giftClass: this,
            itemRepository,
            changes: []
        })
    }
}
