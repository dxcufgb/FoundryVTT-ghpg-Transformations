export function createTriggerRuntime({
    tracker,
    transformationService,
    logger
})
{
    logger.debug("createTriggerRuntime", { tracker, transformationService })

    async function run(triggerName, actor, context = {})
    {
        logger.debug("createTriggerRuntime.run", { triggerName, actor, context })
        return tracker.track(
            (async () =>
            {
                logger.debug("TriggerRuntime.run called", triggerName, actor, context)
                if (!actor) return
                return transformationService.onTrigger(actor, triggerName, context)
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        run
    })

}
