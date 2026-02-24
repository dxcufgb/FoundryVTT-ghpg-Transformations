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
                        let item = actor.items.find(i =>
                            i.flags.transformations?.sourceUuid === uuid
                        )

                        if (!item) return false

                        const remaining = item.system.uses.max - item.system.uses.spent

                        if (remaining < uses) return false

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
