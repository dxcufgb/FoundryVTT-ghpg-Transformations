export function createGeneralHandlers({
    activeEffectRepository,
    itemRepository,
    logger
})
{
    return Object.freeze({

        async removeOnLongRest({ actor, trigger })
        {
            if (trigger !== "longRest") return
            await itemRepository.removeItemsOnLongRest(actor)
            await activeEffectRepository.removeEffectsOnLongRest(actor)
        }
    })
}