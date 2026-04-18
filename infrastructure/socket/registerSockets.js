export function registerSockets({
    socketGateway,
    transformationMutationGateway,
    createGMTransformationHandlers,
    getDialogFactory,
    logger
})
{
    logger.debug("registerSockets", {
        socketGateway,
        transformationMutationGateway,
        createGMTransformationHandlers,
        getDialogFactory
    })

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

    socketGateway.register(
        "openDialog",
        async payload =>
        {
            logger.debug("registerSockets.openDialog", {payload})

            const dialogFactory = getDialogFactory?.()
            const methodName = payload?.methodName
            const data = await hydrateDialogData(payload?.data ?? {})
            const method = dialogFactory?.[methodName]

            if (typeof method !== "function") {
                logger.warn("openDialog requested unknown dialog factory method", {
                    methodName,
                    payload
                })
                return false
            }

            return method.call(dialogFactory, {
                ...data,
                skipUserRouting: true
            })
        }
    )
}

async function hydrateDialogData(data = {})
{
    const hydrated = foundry.utils.deepClone(data ?? {})
    const resolver =
              globalThis.fromUuid ??
              (typeof fromUuid === "function" ? fromUuid : null)

    if (!resolver) return hydrated

    if (hydrated.actorUuid && !hydrated.actor) {
        hydrated.actor = await resolver(hydrated.actorUuid).catch(() => null)
    }

    if (hydrated.itemUuid && !hydrated.item) {
        hydrated.item = await resolver(hydrated.itemUuid).catch(() => null)
    }

    if (Array.isArray(hydrated.choices)) {
        hydrated.choices = hydrated.choices.map(choice =>
        {
            const nextChoice = foundry.utils.deepClone(choice)
            delete nextChoice.sourceItem
            return nextChoice
        })
    }

    return hydrated
}
