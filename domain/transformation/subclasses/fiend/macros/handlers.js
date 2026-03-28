export function createFiendMacroHandlers({
    activeEffectRepository,
    itemRepository,
    giftsOfDamnation,
    tracker,
    logger
})
{
    logger.debug("createFiendMacroHandlers", {
        activeEffectRepository,
        itemRepository,
        tracker
    })

    return Object.freeze({
        whenIdle: tracker.whenIdle,

        async grantGift({actor, args})
        {
            const giftId = args

            const entry = giftsOfDamnation.find(g => g.id === giftId)
            if (!entry) return

            const GiftClass = entry.GiftClass

            await GiftClass.grant(actor)
        }

    })
}