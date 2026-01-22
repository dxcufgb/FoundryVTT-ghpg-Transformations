import { createGMTransformationHandlers } from "./gmTransformationHandlers.js";

export function registerSockets({
    socketGateway,
    infrastructure,
    logger
}) {
    const gateway = infrastructure.transformationMutationGateway;

    const handlers = createGMTransformationHandlers({
        gateway,
        logger
    });

    socketGateway.register(
        "applyTransformation",
        handlers.applyTransformation
    );

    socketGateway.register(
        "initializeTransformation",
        handlers.initializeTransformation
    );

    socketGateway.register(
        "advanceStage",
        handlers.advanceStage
    );

    socketGateway.register(
        "clearTransformation",
        handlers.clearTransformation
    );

    socketGateway.register(
        "applyTriggerActions",
        handlers.applyTriggerActions
    );
}
