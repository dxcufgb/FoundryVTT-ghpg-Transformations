import { UiAccessor } from "../../bootstrap/uiAccessor.js"
import {
    normalizeTransformationStageChoiceCount,
    normalizeTransformationStageChoiceSelection,
    serializeTransformationStageChoiceSelection
} from "../../utils/transformationStageChoiceSelection.js"

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

    async function onActorFlagsUpdated({ actor, diff, userId = null })
    {
        logger.debug("createTransformationService.onActorFlagsUpdated", {
            actor,
            diff,
            userId
        })
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
                    await handleTransformationChanged(actor, userId)
                    return
                }

                if ("stage" in transformationsFlags) {
                    const previousStage = actor?.flags?.transformations?.finishedStage ?? 0
                    const newStage = actor.flags?.transformations?.stage
                    if (newStage > previousStage) {
                        await handleStageChanged(actor, userId)
                    }
                }
            })()
        )
    }

    async function handleTransformationChanged(actor, triggeringUserId = null)
    {
        logger.debug("createTransformationService.handleTransformationChanged", {
            actor,
            triggeringUserId
        })
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
                    definition,
                    triggeringUserId
                })
            })()
        )
    }

    async function handleStageChanged(actor, triggeringUserId = null)
    {
        logger.debug("createTransformationService.handleStageChanged", {
            actor,
            triggeringUserId
        })
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
                let choiceObjects = []
                if (definition.stages[stage].choices !== undefined) {
                    const choiceItems = definition.stages[stage].choices.items
                    const choiceCount =
                              normalizeTransformationStageChoiceCount(
                                  definition.stages[stage].choices?.count
                              )
                    choice = actor.getFlag(
                        "transformations",
                        "stageChoices"
                    )?.[definition.id]?.[stage]
                    if (choice === undefined) {
                        choice = await stageChoiceResolver.resolve({
                            actor,
                            definition,
                            stage,
                            requestChoice: async ({
                                actor,
                                choices,
                                choiceCount,
                                autoSelect = false
                            }) =>
                            {
                                if (autoSelect) {
                                    await showAutoSelectedChoiceInfoDialogs({
                                        dialogFactory,
                                        choices,
                                        triggeringUserId
                                    })

                                    return serializeTransformationStageChoiceSelection(
                                        choices.map(entry => entry.uuid),
                                        choiceCount
                                    )
                                }

                                return dialogFactory.openStageChoiceDialog({
                                    actor,
                                    choices,
                                    choiceCount,
                                    stage,
                                    triggeringUserId
                                })
                            }
                        })
                    }
                    if (choice === undefined) {
                        await actorRepository.setTransformationStage(
                            actor,
                            Math.max(1, stage - 1)
                        )
                        return
                    }
                    const normalizedChoiceSelection =
                              normalizeTransformationStageChoiceSelection(
                                  choice,
                                  choiceCount
                              )

                    await actor.setFlag(
                        "transformations",
                        "stageChoices",
                        storeStageChoiceSelection(
                            actor.getFlag("transformations", "stageChoices"),
                            definition.id,
                            stage,
                            serializeTransformationStageChoiceSelection(
                                normalizedChoiceSelection,
                                choiceCount
                            )
                        )
                    )
                    choiceObjects = choiceItems.filter(choiceItem =>
                        normalizedChoiceSelection.includes(choiceItem.uuid)
                    )
                }

                await mutationGateway.advanceStage({
                    actorId: actor.id,
                    definition,
                    stage,
                    choice: choiceObjects[0] ?? null,
                    choices: choiceObjects,
                    triggeringUserId
                })
            })()
        )
    }

    async function showAutoSelectedChoiceInfoDialogs({
        dialogFactory,
        choices = [],
        triggeringUserId = null
    } = {})
    {
        if (!shouldShowAutoSelectedChoiceInfoDialog()) {
            return
        }

        if (!dialogFactory?.showItemInfoDialog) {
            return
        }

        for (const choice of choices) {
            const item = choice?.sourceItem ??
                (choice?.uuid ? await fromUuid(choice.uuid) : null)

            if (!item) {
                continue
            }

            await dialogFactory.showItemInfoDialog({
                item,
                triggeringUserId
            })
        }
    }

    function shouldShowAutoSelectedChoiceInfoDialog()
    {
        return globalThis.__TRANSFORMATIONS_TEST__ !== true ||
            globalThis.__TRANSFORMATIONS_SHOW_AUTOSELECT_ITEM_INFO__ === true
    }

    async function onTrigger(actor, triggerName, context)
    {
        logger.debug("createTransformationService.onTrigger", { actor, triggerName, context })
        assertActor(actor)

        return tracker.track(
            (async () =>
            {
                const transformation = await transformationQueryService.getForActor(actor)

                if (!transformation) return

                const actionGroups = transformation.getTriggerActionGroups(triggerName)

                if (!actionGroups || actionGroups.length === 0) return

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
                    actionGroups.length
                )

                return mutationGateway.applyTriggerActions({
                    actorId: actor.id,
                    actionGroups,
                    context: {
                        ...context,
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

function storeStageChoiceSelection(
    existingStageChoices,
    definitionId,
    stage,
    choiceSelection
)
{
    const storedStageChoices = foundry.utils.deepClone(
        existingStageChoices ?? {}
    )

    storedStageChoices[definitionId] ??= {}
    storedStageChoices[definitionId][stage] = choiceSelection

    return storedStageChoices
}
