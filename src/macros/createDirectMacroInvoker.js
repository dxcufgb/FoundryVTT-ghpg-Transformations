export function createDirectMacroInvoker({
    tracker,
    macroRegistry,
    activeEffectRepository,
    itemRepository,
    logger
})
{
    logger.debug("createDirectMacroInvoker", {
        tracker,
        macroRegistry,
        activeEffectRepository,
        itemRepository
    })

    async function invoke({
        transformationType,
        action,
        actor,
        context
    })
    {
        logger.debug("createDirectMacroInvoker.invoke", {
            transformationType,
            action,
            actor,
            context
        })
        const entry = macroRegistry.get(transformationType)
        if (!entry) {
            throw new Error(`Unknown transformation: ${transformationType}`)
        }

        const handlers = entry.createHandlers({
            logger,
            activeEffectRepository,
            itemRepository,
            tracker
        })

        const handler = handlers[action]
        if (typeof handler !== "function") {
            throw new Error(
                `Handler '${action}' not found for ${transformationType}`
            )
        }

        return tracker.track(
            (async () =>
            {
                return handler({
                    actor,
                    trigger: context.trigger,
                    context
                })
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        invoke
    })

}
