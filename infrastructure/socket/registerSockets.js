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
        "downgradeStage",
        handlers.downgradeStage
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
                logger.error("openDialog requested unknown dialog factory method", {
                    methodName,
                    hasDialogFactory: Boolean(dialogFactory),
                    payload
                })
                return false
            }

            if (payload?.data?.actorUuid && !data.actor) {
                logger.error("openDialog could not resolve actor", {
                    methodName,
                    actorUuid: payload.data.actorUuid
                })
                return false
            }

            try {
                return await method.call(dialogFactory, {
                    ...data,
                    skipUserRouting: true
                })
            } catch (error) {
                logger.error("openDialog failed", {methodName, error})
                throw error
            }
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
