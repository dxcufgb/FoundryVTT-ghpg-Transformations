export function createTransformationService({
    mutationGateway,
    transformationQueryService,
    variableResolver,
    logger
}) {

    // ─────────────────────────────────────────────────────────────
    // Public commands
    // ─────────────────────────────────────────────────────────────

    async function applyTransformation(actor, transformation) {
        assertActor(actor);
        assertTransformation(transformation);

        logger.debug(
            "Applying transformation",
            actor.id,
            transformation.definition
        );

        return mutationGateway.applyTransformation({
            actorId: actor.id,
            definition: transformation.definition,
            stage: 1
        });
    }

    async function clearTransformation(actor) {
        assertActor(actor);

        logger.debug("Clearing transformation", actor.id);

        return mutationGateway.clearTransformation({
            actorId: actor.id
        });
    }

    // ─────────────────────────────────────────────────────────────
    // Actor flag reactions
    // ─────────────────────────────────────────────────────────────

    async function onActorFlagsUpdated({ actor, diff }) {
        const dnd5eFlags = diff?.flags?.dnd5e;
        if (!dnd5eFlags) return;

        if ("transformations" in dnd5eFlags) {
            await handleTransformationChanged(actor);
            return;
        }

        if ("transformationStage" in dnd5eFlags) {
            await handleStageChanged(actor);
        }
    }

    async function handleTransformationChanged(actor) {
        const transformationId = actor.flags?.dnd5e?.transformations;

        if (!transformationId) {
            logger.debug("Transformation removed", actor.id);
            return;
        }

        const definition = await transformationQueryService.getDefinitionById(transformationId);

        if (!definition) {
            logger.warn(
                "No transformation definition found",
                transformationId
            );
            return;
        }

        await mutationGateway.initializeTransformation({
            actorId: actor.id,
            definition
        });
    }

    async function handleStageChanged(actor) {
        const stage = actor.flags?.dnd5e?.transformationStage;

        logger.debug(
            "Transformation stage updated",
            actor.id,
            stage
        );

        await mutationGateway.advanceStage({
            actorId: actor.id,
            stage
        });
    }

    async function onTrigger(actor, triggerName) {
        assertActor(actor);

        const transformation = await transformationQueryService.getForActor(actor);

        if (!transformation) return;

        const actions = transformation.getTriggerActions(triggerName);

        if (!actions || actions.length === 0) return;

        const rawVariables = transformation.getTriggerVariables(triggerName);

        const variables = variableResolver.resolve({
            actor,
            transformation,
            rawVariables,
            context: {
                trigger: triggerName,
                stage: transformation.stage
            }
        });

        logger.debug(
            "Executing transformation trigger",
            actor.id,
            triggerName,
            actions.length
        );

        return mutationGateway.applyTriggerActions({
            actorId: actor.id,
            actions,
            context: {
                trigger: triggerName,
                stage: transformation.stage
            },
            variables
        });
    }

    return Object.freeze({
        applyTransformation,
        clearTransformation,
        onActorFlagsUpdated,

        onTrigger
    });

    function assertActor(actor) {
        if (!actor) {
            throw new Error("TransformationService requires actor");
        }
    }

    function assertTransformation(transformation) {
        if (!transformation?.definition) {
            throw new Error(
                "TransformationService requires a valid transformation"
            );
        }
    }
}
