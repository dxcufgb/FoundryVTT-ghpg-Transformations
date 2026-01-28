export function createTriggerRuntime({
    transformationService,
    logger
}) {
    async function run(triggerName, actor) {
        logger.debug("TriggerRuntime.run called", triggerName, actor);
        if (!actor) return;
        return transformationService.onTrigger(actor, triggerName);
    }

    return Object.freeze({ run });
}