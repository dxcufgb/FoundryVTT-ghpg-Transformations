import { applyGiftOfDamnation } from "./applyGiftOfDamnation.js"

export class GiftOfUnbridledPower
{
    static id = "giftOfUnbridledPower"
    static label = "Gift of Unbridled Power"
    static stage = 9
    static description = "Placeholder effect for Gift of Unbridled Power."

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
