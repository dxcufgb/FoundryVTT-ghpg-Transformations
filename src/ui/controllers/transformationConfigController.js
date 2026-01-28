export function createTransformationConfigController({
    transformationService,
    transformationQueryService,
    actorQueryService,
    logger
}) {

    async function applySelection({ actorId, transformationId }) {
        const actor = await actorQueryService.getById(actorId);

        if (!actor) {
            logger.warn(
                "TransformationConfigController: actor not found",
                actorId
            );
            return;
        }

        if (transformationId === "None") {
            return transformationService.clearTransformation(actor);
        }

        const definition =
            await transformationQueryService.getDefinitionById(
                transformationId
            );

        if (!definition) {
            logger.warn(
                "TransformationConfigController: definition not found",
                transformationId
            );
            return;
        }

        await transformationService.applyTransformation(
            actor,
            { definition }
        );
    }

    return Object.freeze({
        applySelection
    });
}
