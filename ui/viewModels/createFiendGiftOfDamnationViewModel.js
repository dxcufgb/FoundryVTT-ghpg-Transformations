import { giftsOfDamnation } from "../../domain/transformation/subclasses/fiend/giftsOfDamnation/index.js"

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

    return {
        stage,
        currentGiftName: activeGiftEffect?.name ?? "None",
        currentGiftId,
        options: availableGifts.map(gift => ({
            value: gift.id,
            label: gift.label,
            description: gift.GiftClass.description,
            selected: gift.id === currentGiftId
        }))
    }
}
