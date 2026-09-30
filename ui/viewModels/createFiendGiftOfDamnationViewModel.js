import { giftsOfDamnation } from "../../domain/transformation/subclasses/fiend/giftsOfDamnation/index.js"
import {
    evaluateGiftSwitch,
    getContractState
} from "../../domain/transformation/subclasses/fiend/giftsOfDamnation/giftContracts.js"

export function createFiendGiftOfDamnationViewModel({
    actor,
    stage,
    logger = null
})
{
    logger?.debug?.("createFiendGiftOfDamnationViewModel", {
        actor,
        stage
    })

    const availableGifts = giftsOfDamnation
        .filter(gift => gift.GiftClass.stage <= stage)

    const activeGiftEffect = actor?.effects?.find(effect =>
        effect.flags?.transformations?.giftOfDamnation === true
    ) ?? null

    const currentGiftId =
        activeGiftEffect?.flags?.transformations?.giftOfDamnationId ?? null

    const signedGiftIds = actor ? getContractState(actor).signed : []

    return {
        stage,
        currentGiftName: activeGiftEffect?.name ?? "None",
        currentGiftId,
        options: availableGifts.map(gift => ({
            value: gift.id,
            label: gift.label,
            description: gift.GiftClass.description,
            selected: gift.id === currentGiftId,
            signed: signedGiftIds.includes(gift.id),
            allowed: evaluateGiftSwitch(actor, gift.id, {replacing: true}).allowed
        }))
    }
}
