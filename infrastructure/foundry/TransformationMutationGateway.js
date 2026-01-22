export function createTransformationMutationGateway({
    socketGateway,
    localMutationAdapter,
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

        logger.debug(
            "Forwarding mutation to GM via socket",
            action,
            payload
        );

        return socketGateway.executeAsGM(action, payload);
    }

    return Object.freeze({
        applyTransformation,
        initializeTransformation,
        advanceStage,
        clearTransformation,
        applyTriggerActions
    });
}
