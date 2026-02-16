export function createItemAction({
    itemRepository,
    tracker,
    logger
})
{
    logger.debug("createItemAction", { itemRepository, tracker })

    return async function APPLY_ITEM({
        actor,
        action,
        context
    })
    {
        const { mode, uuid, uses = 1 } = action.data
        return tracker.track(
            (async () =>
            {
                switch (mode) {

                    case "add": {
                        await itemRepository.addItemFromUuid(actor, uuid, { context })
                        return true
                    }

                    case "consume": {
                        const item =
                            itemRepository.findEmbeddedByUuidFlag(actor, uuid)

                        if (!item) {
                            logger.debug("Item not found to consume", uuid)
                            return false
                        }

                        const remaining =
                            itemRepository.getRemainingUses(item)

                        if (remaining < uses) {
                            logger.debug(
                                "Not enough uses remaining",
                                item.name,
                                remaining,
                                uses
                            )
                            return false
                        }

                        await itemRepository.consumeUses(item, uses)
                        return true
                    }

                    case "remove": {
                        await itemRepository.removeBySourceUuid(actor, uuid)
                        return true
                    }

                    default:
                        logger.warn("Unknown item action mode", mode, action)
                        return false
                }
            })()
        )

    }
}
