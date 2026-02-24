export function createMacroAction({
    directMacroInvoker,
    tracker,
    logger
})
{
    logger.debug("createMacroAction", { directMacroInvoker, tracker })

    return async function MACRO({
        actor,
        action,
        context,
        variables
    })
    {
        logger.debug("createMacroAction.MACRO", {
            actor,
            action,
            context,
            variables
        })

        const data = action.data

        if (!data?.transformationType || !data?.action) {
            logger.warn(
                "Invalid MACRO action payload",
                action
            )
            return false
        }

        logger.debug(
            "Executing MACRO action",
            data.transformationType,
            data.action,
            context.trigger
        )

        return tracker.track(
            (async () =>
            {
                try {
                    const result = await directMacroInvoker.invoke({
                        actor,
                        transformationType: data.transformationType,
                        action: data.action,
                        context: {
                            actorUuid: actor.uuid,
                            ...data.args,
                            ...variables,
                            ...context
                        }
                    })

                    return result === true
                }
                catch (err) {
                    logger.warn("MACRO action failed", err)
                    return false
                }
            })()
        )
    }
}
