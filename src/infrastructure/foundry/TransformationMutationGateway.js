export function createTransformationMutationGateway({
    socketGateway,
    localMutationAdapter,
    actionExecutor,
    actionHandlers,
    logger
}) {

    async function applyTransformation(payload) {
        return execute("applyTransformation", payload);
    }

    async function initializeTransformation(payload) {
        return execute("initializeTransformation", payload);
    }

    async function advanceStage(payload) {
        return execute("advanceStage", payload);
    }

    async function clearTransformation(payload) {
        return execute("clearTransformation", payload);
    }

    async function applyTriggerActions(payload) {
        return execute("applyTriggerActions", payload);
    }

    async function execute(action, payload) {
        if (socketGateway.canMutateLocally()) {
            assertLocalAuthority(action, payload);

            // ─────────────────────────────────────────────────────────────
            // Special case: trigger actions need handlers
            // ─────────────────────────────────────────────────────────────
            if (action === "applyTriggerActions") {
                logger.debug(
                    "Executing trigger actions locally",
                    payload
                );

                return actionExecutor.execute({
                    ...payload,
                    handlers: actionHandlers
                });
            }

            // ─────────────────────────────────────────────────────────────
            // Standard local mutation
            // ─────────────────────────────────────────────────────────────
            const fn = localMutationAdapter[action];

            if (typeof fn !== "function") {
                const err = new Error(
                    `Local mutation adapter missing method: ${action}`
                );

                logger.error(err.message, {
                    action,
                    payload,
                    available: Object.keys(localMutationAdapter)
                });

                throw err;
            }

            logger.debug(
                "Executing local mutation",
                action,
                payload
            );

            return fn(payload);
        }

        // ─────────────────────────────────────────────────────────────
        // Remote execution via GM socket
        // ─────────────────────────────────────────────────────────────
        logger.debug(
            "Forwarding mutation to GM via socket",
            action,
            payload
        );

        if (!socketGateway.isReady()) {
            throw new Error(
                `Socket gateway not ready for action: ${action}`
            );
        }

        return socketGateway.executeAsGM(action, payload);
    }

    return Object.freeze({
        applyTransformation,
        initializeTransformation,
        advanceStage,
        clearTransformation,
        applyTriggerActions
    });

    function assertLocalAuthority(action, payload) {
        if (!socketGateway.canMutateLocally()) {
            const err = new Error(
                `Illegal local mutation attempt: ${action}`
            );

            logger.error(err.message, {
                action,
                payload,
                user: game.user?.id
            });

            throw err;
        }
    }

}
