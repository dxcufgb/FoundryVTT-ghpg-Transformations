import { UiAccessor } from "../../bootstrap/uiAccessor.js"
export function createTransformationService({
    tracker,
    mutationGateway,
    transformationQueryService,
    variableResolver,
    stageChoiceResolver,
    actorRepository,
    logger
})
{
    logger.debug("createTransformationService", {
        tracker,
        mutationGateway,
        transformationQueryService,
        variableResolver,
        stageChoiceResolver,
        actorRepository
    })

    async function applyTransformation(actor, transformation)
    {
        logger.debug("createTransformationService.applyTransformation", { actor, transformation })
        return tracker.track(
            (async () =>
            {
                assertActor(actor)
                assertTransformation(transformation)

                logger.debug(
                    "Applying transformation",
                    actor.id,
                    transformation.definition
                )

                return mutationGateway.applyTransformation({
                    actorId: actor.id,
                    definition: transformation.definition,
                })
            })()
        )
    }

    async function clearTransformation(actor)
    {
        logger.debug("createTransformationService.clearTransformation", { actor })
        return tracker.track(
            (async () =>
            {
                assertActor(actor)

                logger.debug("Clearing transformation", actor.id)

                return mutationGateway.clearTransformation({
                    actorId: actor.id
                })
            })()
        )
    }

    async function onActorFlagsUpdated({ actor, diff })
    {
        logger.debug("createTransformationService.onActorFlagsUpdated", { actor, diff })
        if (!actor) {
            logger.warn(
                "Transformation skipped: actor no longer exists",
                actorUuid
            )
            return
        }
        const transformationsFlags = diff?.flags?.transformations
        if (!transformationsFlags) return

        return tracker.track(
            (async () =>
            {
                if ("type" in transformationsFlags) {
                    await handleTransformationChanged(actor)
                    return
                }

                if ("stage" in transformationsFlags) {
                    if (actor.getFlag("transformations", "stage") > diff.flags.transformations.stage) {
                        await handleStageChanged(actor)
                    }
                }
            })()
        )
    }

    async function handleTransformationChanged(actor)
    {
        logger.debug("createTransformationService.handleTransformationChanged", { actor })
        const transformationId = actor.flags?.transformations?.type

        if (!transformationId) {
            logger.debug("Transformation removed", actor.id)
            return
        }

        return tracker.track(
            (async () =>
            {
                const definition = await transformationQueryService.getDefinitionById(transformationId)

                if (!definition) {
                    logger.warn(
                        "No transformation definition found",
                        transformationId
                    )
                    return
                }

                await mutationGateway.initializeTransformation({
                    actorId: actor.id,
                    definition
                })
            })()
        )
    }

    async function handleStageChanged(actor)
    {
        logger.debug("createTransformationService.handleStageChanged", { actor })
        const dialogFactory = UiAccessor.dialogs
        if (!dialogFactory) {
            logger.debug(
                "Stage choice skipped: dialog factory not available",
                definition.id,
                newStage
            )
            return null
        }

        const stage = actor.flags?.transformations?.stage
        if (!stage) return

        return tracker.track(
            (async () =>
            {
                const transformation = await transformationQueryService.getForActor(actor)
                if (!transformation) return

                logger.debug(
                    "Transformation stage updated",
                    actor.id,
                    transformation,
                    stage
                )

                const definition = transformation.definition

                let choice = null
                if (definition.stages[stage].choices !== undefined) {
                    choice = actor.getFlag(
                        "transformations",
                        "stageChoices"
                    )?.[definition.id]?.[stage]
                    if (choice === undefined) {
                        choice = await stageChoiceResolver.resolve({
                            actor,
                            definition,
                            stage,
                            requestChoice: ({ actor, choices }) =>
                                dialogFactory.openStageChoiceDialog({
                                    actor,
                                    choices,
                                    stage
                                })
                        })
                        actor.setFlag(
                            "transformations",
                            "stageChoices",
                            {
                                [definition.id]: {
                                    [stage]: choice
                                }
                            }
                        )
                    }
                    if (choice === undefined) {
                        await actorRepository.setTransformationStage(
                            actor,
                            Math.max(1, stage - 1)
                        )
                        return
                    }
                }

                await mutationGateway.advanceStage({
                    actorId: actor.id,
                    definition,
                    stage,
                    choice
                })
            })()
        )
    }

    async function onTrigger(actor, triggerName)
    {
        logger.debug("createTransformationService.onTrigger", { actor, triggerName })
        assertActor(actor)

        return tracker.track(
            (async () =>
            {
                const transformation = await transformationQueryService.getForActor(actor)

                if (!transformation) return

                const actions = transformation.getTriggerActions(triggerName)

                if (!actions || actions.length === 0) return

                const rawVariables = transformation.getTriggerVariables(triggerName)

                const variables = variableResolver.resolve({
                    actor,
                    transformation,
                    rawVariables,
                    context: {
                        trigger: triggerName,
                        stage: transformation.stage
                    }
                })

                logger.debug(
                    "Executing transformation trigger",
                    actor.id,
                    triggerName,
                    actions.length
                )

                return mutationGateway.applyTriggerActions({
                    actorId: actor.id,
                    actions,
                    context: {
                        trigger: triggerName,
                        stage: transformation.stage
                    },
                    variables
                })
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        applyTransformation,
        clearTransformation,
        onActorFlagsUpdated,

        onTrigger
    })

    function assertActor(actor)
    {
        logger.debug("createTransformationService.assertActor", { actor })
        if (!actor) {
            throw new Error("TransformationService requires actor")
        }
    }

    function assertTransformation(transformation)
    {
        logger.debug("createTransformationService.assertTransformation", { transformation })
        if (!transformation?.definition) {
            throw new Error(
                "TransformationService requires a valid transformation"
            )
        }
    }
}
