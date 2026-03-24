import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

export class GiftOfMartialProwess
{
    static id = "giftOfMartialProwess"
    static label = "Gift of Martial Prowess"
    static stage = 8
    static description = "Placeholder effect for Gift of Martial Prowess."

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
