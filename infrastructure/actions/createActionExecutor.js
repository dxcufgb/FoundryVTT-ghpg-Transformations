import { conditionsMet } from "../../domain/actions/conditionSchema.js"

// infrastructure/actions/actionExecutor.js
export function createActionExecutor({
    tracker,
    actorRepository,
    logger
})
{
    logger.debug("createActionExecutor", {
        tracker,
        actorRepository
    })

    async function execute({
        actorId,
        actions,
        context,
        variables,
        handlers
    })
    {
        logger.debug("createActionExecutor.execute", {
            actorId,
            actions,
            context,
            variables,
            handlers
        })
        const actor = actorRepository.getById(actorId)
        if (!actor || !Array.isArray(actions)) return

        return tracker.track(
            (async () =>
            {

                for (const action of actions) {
                    if (!conditionsMet(actor, action.when, {
                        ...context,
                        variables
                    })) {
                        logger.debug(
                            "Action skipped (conditions not met)",
                            action.type,
                            action.when
                        )
                        continue
                    }
                    const handler = handlers[action.type]

                    if (!handler) {
                        logger.warn(
                            "No handler for action type",
                            action.type
                        )
                        continue
                    }

                    await handler({
                        actor,
                        action,
                        context,
                        variables
                    })
                }
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        execute
    })

}
