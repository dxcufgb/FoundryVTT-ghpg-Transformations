import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

export class GiftOfSecondChances
{
    static id = "giftOfSecondChances"
    static label = "Gift of Second Chances"
    static stage = 6
    static description = "Placeholder effect for Gift of Second Chances."

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
