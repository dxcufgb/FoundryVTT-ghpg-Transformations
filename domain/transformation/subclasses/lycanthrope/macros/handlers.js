import {
    LYCANTHROPE_HYBRID_FORM_ITEM_UUIDS,
    LYCANTHROPE_TRANSFORM_ACTIVITY_NAME
} from "../constants.js"

export function createLycanthropeMacroHandlers({
    itemRepository,
    tracker,
    logger
})
{
    logger.debug("createLycanthropeMacroHandlers", {
        itemRepository,
        tracker
    })

    return Object.freeze({
        whenIdle: tracker.whenIdle,

        async triggerBloodiedHybridTransform({ actor })
        {
            logger.debug(
                "createLycanthropeMacroHandlers.triggerBloodiedHybridTransform",
                { actor }
            )

            return tracker.track(
                (async () =>
                {
                    if (!actor) return false

                    const hybridFormItem = findHybridFormItem(actor)
                    if (!hybridFormItem) {
                        logger.warn(
                            "No lycanthrope hybrid form item found on actor",
                            actor
                        )
                        return false
                    }

                    const transformActivity = findActivityByName(
                        hybridFormItem,
                        LYCANTHROPE_TRANSFORM_ACTIVITY_NAME
                    )

                    if (typeof transformActivity?.use !== "function") {
                        logger.warn(
                            "Lycanthrope hybrid form item is missing Transform activity",
                            hybridFormItem
                        )
                        return false
                    }

                    await transformActivity.use({ actor })
                    return true
                })()
            )
        }
    })

    function findHybridFormItem(actor)
    {
        for (const uuid of LYCANTHROPE_HYBRID_FORM_ITEM_UUIDS) {
            const item = itemRepository.findEmbeddedByUuidFlag(actor, uuid)
            if (item) return item
        }

        return null
    }
}

function findActivityByName(item, activityName)
{
    const activities = normalizeActivities(
        item?.system?.activities ?? item?.activities ?? []
    )

    return activities.find(activity => activity?.name === activityName) ?? null
}

function normalizeActivities(activities)
{
    if (!activities) return []

    if (Array.isArray(activities)) return activities

    if (Array.isArray(activities?.contents)) {
        return activities.contents
    }

    if (typeof activities?.find === "function") {
        const collected = []
        for (const activity of activities) {
            collected.push(activity)
        }
        return collected
    }

    if (typeof activities === "object") {
        return Object.values(activities).filter(activity =>
            activity && activity !== activities.contents
        )
    }

    return []
}
