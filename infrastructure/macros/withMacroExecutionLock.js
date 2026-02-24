export async function withMacroExecutionLock(
    {
        actor,
        transformationType,
        action,
        trigger,
        logger
    },
    execute,
    {
        actorRepository
    }
) {
    logger.debug("withMacroExecutionLock", {
        actor,
        transformationType,
        action,
        trigger
    })
    if (!actor) {
        throw new Error("withMacroExecutionLock requires actor");
    }

    const flagKey = `macro:${transformationType}:${action}:${trigger}`;

    const isLocked = actorRepository.hasMacroExecution(actor, flagKey);

    if (isLocked) {
        logger.debug(
            "Macro execution suppressed (already running)",
            actor.id,
            flagKey
        );
        return;
    }

    await actorRepository.setMacroExecution(actor, flagKey);

    try {
        await execute();
    } catch (err) {
        logger.error(
            "Macro execution failed",
            actor.id,
            flagKey,
            err
        );
        throw err;
    } finally {
        await actorRepository.clearMacroExecution(actor, flagKey);

        logger.debug(
            "Macro execution released",
            actor.id,
            flagKey
        );
    }
}
