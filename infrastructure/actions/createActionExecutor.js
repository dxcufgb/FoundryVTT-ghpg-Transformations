import { conditionsMet } from "../../domain/actions/conditionSchema.js"

// infrastructure/actions/actionExecutor.js

export function createActionExecutor({
    tracker,
    actorRepository,
    onceService,
    logger
})
{
    logger.debug("createActionExecutor", {
        tracker,
        actorRepository
    })

    // Once keys whose action is currently running (actor uuid + key).
    const runningOnceKeys = new Set()

    async function execute({
        actorId,
        actions,
        actionGroups,
        context,
        variables,
        handlers
    })
    {
        logger.debug("createActionExecutor.execute", {
            actorId,
            actions,
            actionGroups,
            context,
            variables,
            handlers
        })
        const actor = actorRepository.getById(actorId)
        if (!actor) return

        // Normalize into groups (supports legacy flat actions)
        const groups = Array.isArray(actionGroups)
            ? actionGroups
            : Array.isArray(actions)
                ? [{ name: "legacy", actions }]
                : []

        return tracker.track(
            (async () =>
            {
                for (const group of groups) {

                    // ─────────────────────────────────────────────
                    // Group-level conditions
                    // ─────────────────────────────────────────────
                    if (!conditionsMet(actor, group.when, {
                        ...context,
                        variables
                    })) {
                        logger.debug(
                            "Action group skipped (conditions not met)",
                            group.name,
                            group.when
                        )
                        continue
                    }

                    for (const action of group.actions ?? []) {

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

                        const onceReservation = action.once?.key
                            ? `${actor.uuid ?? actor.id}:${action.once.key}`
                            : null
                        if (onceReservation) {
                            const hasBeenExecuted = onceService.hasOnceBeenExecuted(actor, action.once.key)
                            if (hasBeenExecuted === true || runningOnceKeys.has(onceReservation)) {
                                logger.debug("Once action skipped", action.once.key)
                                continue
                            }
                        }
                        const handler = handlers[action.type]
                        // After handler execution
                        if (!handler) {
                            logger.warn(
                                "No handler for action type",
                                action.type
                            )
                            continue
                        }

                        // Claim the once key before awaiting, so triggers that share it and run at the same time
                        // (e.g. Bloodied and 0 HP from one hit) can't both pass the check.
                        if (onceReservation) runningOnceKeys.add(onceReservation)
                        let result
                        try {
                            result = await handler({
                                actor,
                                action,
                                context,
                                variables
                            })

                            if (action.once?.key && result !== false) {
                                await onceService.setOnceFlag(actor, action.once)
                            }
                        } finally {
                            if (onceReservation) runningOnceKeys.delete(onceReservation)
                        }

                        if (action.data?.blocker === true && result === false) {
                            logger.debug(
                                "Blocker triggered, stopping group execution",
                                group.name
                            )
                            break
                        }
                    }
                }

            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        execute
    })

}

