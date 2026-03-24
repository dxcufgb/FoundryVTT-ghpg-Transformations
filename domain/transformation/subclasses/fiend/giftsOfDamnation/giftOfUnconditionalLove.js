import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

export class GiftOfUnconditionalLove
{
    static id = "giftOfUnconditionalLove"
    static label = "Gift of Unconditional Love"
    static stage = 7
    static description = "Placeholder effect for Gift of Unconditional Love."

    static async apply({actor, actorRepository, itemRepository}) {
        return applyGiftOfDamnation({
            actor,
            giftClass: this,
            itemRepository,
            actorRepository,
            changes: []
        })
    }
}
