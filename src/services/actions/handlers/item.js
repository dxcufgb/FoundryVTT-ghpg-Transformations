export function createItemAction({
    itemRepository,
    tracker,
    logger
})
{
    return async function APPLY_ITEM({
        actor,
        action,
        context
    })
    {
        const {
            uuid,
            mode = "add",
            uses = 1,
            blocker = false
        } = action.data ?? {}

        if (!uuid) {
            logger.warn("Item action missing uuid", action)
            return
        }

        logger.debug(
            "Executing item action",
            actor.id,
            mode,
            uuid
        )

        return tracker.track(
            (async () =>
            {
                switch (mode) {
                    case "add": {
                        await itemRepository.addItemFromUuid(actor, uuid, {
                            context
                        })
                        break
                    }

                    case "consume": {
                        const item =
                            itemRepository.findEmbeddedByUuidFlag(
                                actor,
                                uuid
                            )

                        if (!item) {
                            logger.debug(
                                "Item not found to consume",
                                uuid
                            )
                            return
                        }

                        const remaining = itemRepository.getRemainingUses(item)

                        if (remaining < uses) {
                            logger.debug(
                                "Not enough uses remaining",
                                item.name,
                                remaining,
                                uses
                            )
                            return
                        }

                        await itemRepository.consumeUses(
                            item,
                            uses
                        )
                        break
                    }

                    case "remove": {
                        await itemRepository.removeBySourceUuid(
                            actor,
                            uuid
                        )
                        break
                    }

                    default:
                        logger.warn(
                            "Unknown item action mode",
                            mode,
                            action
                        )
                }

                if (blocker) {
                    context.blocked = true
                }
            })()
        )
    }
}
