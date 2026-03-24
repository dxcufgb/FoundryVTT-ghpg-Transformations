export function createApplyFiendGiftOfDamnation({
    tracker,
    activeEffectRepository,
    actorRepository,
    advancementChoiceHandler,
    itemRepository,
    logger = null
})
{
    logger?.debug?.("createApplyFiendGiftOfDamnation", {
        tracker,
        activeEffectRepository,
        actorRepository,
        advancementChoiceHandler,
        itemRepository
    })

    async function applyFiendGiftOfDamnation({
        actor,
        gift
    })
    {
        logger?.debug?.("applyFiendGiftOfDamnation", {
            actor,
            giftId: gift?.id
        })

        return tracker.track(
            (async () =>
            {
                if (!actor || !gift?.GiftClass) {
                    return null
                }

                const existingEffects = activeEffectRepository
                    .getAll(actor)
                    .filter(effect =>
                        effect.flags?.transformations?.giftOfDamnation === true
                    )

                if (existingEffects.length) {
                    const existingGiftIds = [
                        ...new Set(
                            existingEffects
                                .map(effect =>
                                    effect.flags?.transformations?.giftOfDamnationId
                                )
                                .filter(Boolean)
                        )
                    ]

                    for (const giftId of existingGiftIds) {
                        const linkedItemIds =
                            actor.flags?.transformations?.fiend?.[giftId]?.itemIds

                        if (Array.isArray(linkedItemIds) && linkedItemIds.length) {
                            const existingItemIds = linkedItemIds.filter(itemId =>
                                actor.items.get(itemId)
                            )

                            if (existingItemIds.length) {
                                await actor.deleteEmbeddedDocuments(
                                    "Item",
                                    existingItemIds
                                )
                            }
                        }

                        await actor.update({
                            [`flags.transformations.fiend.-=${giftId}`]: null
                        })
                    }

                    await activeEffectRepository.removeByIds(
                        actor,
                        existingEffects.map(effect => effect.id)
                    )
                }

                if (typeof gift.GiftClass.apply !== "function") {
                    return null
                }

                return gift.GiftClass.apply({
                    actor,
                    actorRepository,
                    itemRepository,
                    advancementChoiceHandler
                })
            })()
        )
    }

    return Object.freeze(
        Object.assign(applyFiendGiftOfDamnation, {
            whenIdle: tracker.whenIdle
        })
    )
}
