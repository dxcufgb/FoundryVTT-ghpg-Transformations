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

        try {
            const entry = macroRegistry.get(transformationType)
            if (!entry) {
                logger.warn(`Unknown transformation: ${transformationType}`)
                return false
            }

            const handlers = entry.createHandlers({
                logger,
                activeEffectRepository,
                itemRepository,
                tracker
            })

            const handler = handlers[action]
            if (typeof handler !== "function") {
                logger.warn(
                    `Handler '${action}' not found for ${transformationType}`
                )
                return false
            }

            const result = await tracker.track(
                (async () =>
                {
                    return handler({
                        actor,
                        trigger: context.trigger,
                        context
                    })
                })()
            )

            if (result === false) return false

            return true
        }
        catch (err) {
            logger.warn("Macro invocation failed", err)
            return false
        }
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        invoke
    })

}
