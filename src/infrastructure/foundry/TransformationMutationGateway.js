export function createTransformationMutationGateway({
    tracker,
    socketGateway,
    localMutationAdapter,
    actionExecutor,
    actionHandlers,
    notifier,
    logger
})
{
    async function applyTransformation(payload)
    {
        return tracker.track(
            (async () =>
            {
                return await execute("applyTransformation", payload)
            })()
        )
    }

    async function initializeTransformation(payload)
    {
        return tracker.track(
            (async () =>
            {
                return await execute("initializeTransformation", payload)
            })()
        )
    }

    async function advanceStage(payload)
    {
        return tracker.track(
            (async () =>
            {
                return await execute("advanceStage", payload)
            })()
        )
    }

    async function clearTransformation(payload)
    {
        return tracker.track(
            (async () =>
            {
                return await execute("clearTransformation", payload)
            })()
        )
    }

    async function applyTriggerActions(payload)
    {
        return tracker.track(
            (async () =>
            {
                return await execute("applyTriggerActions", payload)
            })()
        )
    }

    async function execute(action, payload)
    {
        return tracker.track(
            (async () =>
            {
                if (socketGateway.canMutateLocally()) {
                    assertLocalAuthority(action, payload)

                    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    // Special case: trigger actions need handlers
                    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    if (action === "applyTriggerActions") {
                        logger.debug(
                            "Executing trigger actions locally",
                            payload
                        )

                        return actionExecutor.execute({
                            ...payload,
                            handlers: actionHandlers
                        })
                    }

                    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    // Standard local mutation
                    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                    const fn = localMutationAdapter[action]

                    if (typeof fn !== "function") {
                        const err = new Error(
                            `Local mutation adapter missing method: ${action}`
                        )

                        logger.error(err.message, {
                            action,
                            payload,
                            available: Object.keys(localMutationAdapter)
                        })

                        throw err
                    }

                    logger.debug(
                        "Executing local mutation",
                        action,
                        payload
                    )

                    return fn(payload)
                } else {
                    if (!socketGateway.isGMOnline()) {
                        socketGateway.enqueue({
                            action,
                            payload
                        })
                        notifier.info(
                            "A GM must be online for this action to be performed. action will run once GM is online!"
                        )
                        return
                    }
                }

                // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                // Remote execution via GM socket
                // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                logger.debug(
                    "Forwarding mutation to GM via socket",
                    action,
                    payload
                )

                if (!socketGateway.isReady()) {
                    throw new Error(
                        `Socket gateway not ready for action: ${action}`
                    )
                }

                return socketGateway.executeAsGM(action, payload)
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        applyTransformation,
        initializeTransformation,
        advanceStage,
        clearTransformation,
        applyTriggerActions
    })

    function assertLocalAuthority(action, payload)
    {
        if (!socketGateway.canMutateLocally()) {
            const err = new Error(
                `Illegal local mutation attempt: ${action}`
            )

            logger.error(err.message, {
                action,
                payload,
                user: game.user?.id
            })

            throw err
        }
    }
}
