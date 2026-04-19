function resolveSourceUuid(document)
{
    return (
        document?.flags?.transformations?.sourceUuid ??
        document?.flags?.core?.sourceId ??
        document?._stats?.compendiumSource ??
        document?.uuid ??
        null
    )
}

function resolveActivities(item)
{
    const activities = item?.system?.activities
    if (!activities) return []

    if (Array.isArray(activities)) {
        return activities.filter(Boolean)
    }

    if (Array.isArray(activities?.contents)) {
        return activities.contents.filter(Boolean)
    }

    if (typeof activities?.values === "function") {
        return Array.from(activities.values()).filter(Boolean)
    }

    if (typeof activities?.[Symbol.iterator] === "function") {
        return Array.from(activities).filter(Boolean)
    }

    if (typeof activities === "object") {
        return Object.values(activities)
        .filter(activity =>
            activity &&
            typeof activity === "object" &&
            (
                typeof activity.use === "function" ||
                typeof activity.name === "string" ||
                typeof activity.id === "string" ||
                typeof activity._id === "string"
            )
        )
    }

    return []
}

function resolveActivity(item, {
    activityUuid = null,
    activityId = null,
    activityName = null
} = {})
{
    const activities = resolveActivities(item)
    if (!activities.length) return null

    if (activityId && typeof item?.system?.activities?.get === "function") {
        const activity = item.system.activities.get(activityId)
        if (activity) return activity
    }

    return activities.find(activity =>
    {
        const sourceUuid = resolveSourceUuid(activity)

        if (activityUuid && sourceUuid === activityUuid) {
            return true
        }

        if (activityId && (activity?.id === activityId || activity?._id === activityId)) {
            return true
        }

        if (activityName && activity?.name === activityName) {
            return true
        }

        return false
    }) ?? null
}

function resolveItem(actor, itemRepository, {
    itemUuid = null,
    itemId = null,
    itemName = null
} = {})
{
    if (!actor) return null

    if (itemId) {
        return itemRepository?.findEmbeddedById?.(actor, itemId) ??
            actor?.items?.get?.(itemId) ??
            actor?.items?.find?.(item => item?.id === itemId) ??
            null
    }

    if (itemUuid) {
        return itemRepository?.findEmbeddedByUuidFlag?.(actor, itemUuid) ??
            actor?.items?.find?.(item =>
                resolveSourceUuid(item) === itemUuid ||
                item?.uuid === itemUuid
            ) ??
            null
    }

    if (itemName) {
        return actor?.items?.find?.(item => item?.name === itemName) ?? null
    }

    return null
}

export function createItemActivityAction({
    itemRepository,
    tracker,
    logger
})
{
    logger.debug("createItemActivityAction", {itemRepository, tracker})

    return async function ITEM_ACTIVITY_ACTION({
        actor,
        action
    })
    {
        if (!actor) return false

        const {
                  itemUuid     = null,
                  itemId       = null,
                  itemName     = null,
                  activityUuid = null,
                  activityId   = null,
                  activityName = null
              } = action?.data ?? {}

        return tracker.track(
            (async () =>
            {
                const item = resolveItem(actor, itemRepository, {
                    itemUuid,
                    itemId,
                    itemName
                })

                if (!item) {
                    logger.warn(
                        "ITEM_ACTIVITY action could not resolve item",
                        action
                    )
                    return false
                }

                const hasExplicitActivitySelector =
                          Boolean(activityUuid || activityId || activityName)

                if (hasExplicitActivitySelector) {
                    const activity = resolveActivity(item, {
                        activityUuid,
                        activityId,
                        activityName
                    })

                    if (!activity || typeof activity.use !== "function") {
                        logger.warn(
                            "ITEM_ACTIVITY action could not resolve usable activity",
                            action
                        )
                        return false
                    }

                    await activity.use()
                    return true
                }

                if (typeof item.use === "function") {
                    await item.use()
                    return true
                }

                const activities = resolveActivities(item)
                if (activities.length === 1 && typeof activities[0]?.use === "function") {
                    await activities[0].use()
                    return true
                }

                logger.warn(
                    "ITEM_ACTIVITY action found no callable item or activity",
                    action
                )
                return false
            })()
        )
    }
}
