// services/actions/macroAction.js

export function createMacroAction({
    directMacroInvoker,
    tracker,
    logger
})
{
    return async function MACRO({
        actor,
        action,
        context,
        variables
    })
    {
        const data = action.data

        if (!data?.type || !data?.action) {
            logger.warn(
                "Invalid MACRO action payload",
                action
            )
            return
        }

        logger.debug(
            "Executing MACRO action",
            data.type,
            data.action,
            context.trigger
        )

        return tracker.track(
            (async () =>
            {
                await directMacroInvoker.invoke({
                    actor,
                    transformationType: data.type,
                    action: data.action,
                    context: {
                        actorUuid: actor.uuid,
                        ...data.args,
                        ...variables,
                        ...context
                    }
                })
            })()
        )
    }
}
