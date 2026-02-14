export function registerSockets({
    socketGateway,
    transformationMutationGateway,
    createGMTransformationHandlers,
    logger
})
{
    const handlers = createGMTransformationHandlers({
        gateway: transformationMutationGateway,
        logger
    })

    socketGateway.register(
        "applyTransformation",
        handlers.applyTransformation
    )

    socketGateway.register(
        "initializeTransformation",
        handlers.initializeTransformation
    )

    socketGateway.register(
        "advanceStage",
        handlers.advanceStage
    )

    socketGateway.register(
        "clearTransformation",
        handlers.clearTransformation
    )

    socketGateway.register(
        "applyTriggerActions",
        handlers.applyTriggerActions
    )
}
