export function createTransformationConfigController({
    transformationService,
    transformationQueryService,
    actorQueryService,
    tracker,
    logger
})
{
    logger.debug("createTransformationConfigController", {
        transformationService,
        transformationQueryService,
        actorQueryService,
        tracker
    })

    async function applySelection({ actorUuid, transformationId })
    {
        logger.debug("createTransformationConfigController.applySelection", { actorUuid, transformationId })
        return tracker.track(
            (async () =>
            {
                const actor = await actorQueryService.getByUuid(actorUuid)

                if (!actor) {
                    logger.warn(
                        "TransformationConfigController: actor not found",
                        actorUuid
                    )
                    return
                }

                // Saving with the active transformation still selected must not re-apply it:
                // that would reset the stage to 0 while keeping the finished stage.
                if (transformationId === (actor.flags?.transformations?.type ?? "None")) {
                    logger.debug(
                        "TransformationConfigController: selection unchanged, nothing to apply",
                        actorUuid,
                        transformationId
                    )
                    return
                }

                if (transformationId === "None") {
                    return transformationService.clearTransformation(actor)
                }

                const definition = await transformationQueryService.getDefinitionById(
                    transformationId
                )

                if (!definition) {
                    logger.warn(
                        "TransformationConfigController: definition not found",
                        transformationId
                    )
                    return
                }

                await transformationService.applyTransformation(
                    actor,
                    { definition }
                )
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        applySelection
    })
}
