export function createTriggerRuntime({
    tracker,
    transformationService,
    logger
})
{
    async function run(triggerName, actor)
    {
        return tracker.track(
            (async () =>
            {
                logger.debug("TriggerRuntime.run called", triggerName, actor)
                if (!actor) return
                return transformationService.onTrigger(actor, triggerName)
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        run
    })

}
