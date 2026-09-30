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

    async function downgradeTransformationStage(actor, {
        triggeringUserId = globalThis.game?.user?.id ?? null
    } = {})
    {
        logger.debug("createTransformationService.downgradeTransformationStage", {
            actor,
            triggeringUserId
        })
        return tracker.track(
            (async () =>
            {
                assertActor(actor)

                const transformationId =
                          actorRepository.getActiveTransformationId(actor)
                if (!transformationId) {
                    return warnAndFail(
                        "no-active-transformation",
                        "Cannot downgrade transformation stage: this actor has no active transformation."
                    )
                }

                const currentStage = Number(
                    actorRepository.getTransformationStage(actor)
                )
                if (!Number.isFinite(currentStage) || currentStage <= 1) {
                    return warnAndFail(
                        "minimum-stage",
                        "Cannot downgrade transformation stage: this actor is already at the minimum stage."
                    )
                }

                const transformation =
                          await transformationQueryService.getForActor(actor)
                if (!transformation?.definition) {
                    return warnAndFail(
                        "missing-definition",
                        `Cannot downgrade transformation stage: no definition was found for '${transformationId}'.`
                    )
                }

                return mutationGateway.downgradeStage({
                    actorId: actor.id,
                    transformationId,
                    fromStage: currentStage,
                    toStage: currentStage - 1,
                    triggeringUserId
                })
            })()
        )
    }

    async function changeTransformationType(actor, transformationId)
    {
        logger.debug("createTransformationService.changeTransformationType", {
            actor,
            transformationId
        })
        assertActor(actor)

        const currentId = actorRepository.getActiveTransformationId(actor) ?? null
        const targetId = transformationId || null
        if (targetId === currentId) {
            return { ok: true, unchanged: true }
        }

        let definition = null
        if (targetId) {
            definition = await transformationQueryService.getDefinitionById(targetId)
            if (!definition) {
                return warnAndFail(
                    "missing-definition",
                    `Cannot change transformation: no definition was found for '${targetId}'.`
                )
            }
        }

        // Remove the old transformation's items, effects and flags before applying a new one.
        if (currentId) {
            await clearTransformation(actor)
        }

        if (definition) {
            await applyTransformation(actor, { definition })
        }

        return { ok: true, transformationId: targetId }
    }

    // Moves the stage one step at a time so every stage in between applies (or removes) its
    // grants and choices. Deliberately not wrapped in tracker.track: each step waits for the
    // tracker to go idle, which would never happen while this promise was itself tracked.
    async function changeTransformationStage(actor, targetStage, {
        triggeringUserId = globalThis.game?.user?.id ?? null
    } = {})
    {
        logger.debug("createTransformationService.changeTransformationStage", {
            actor,
            targetStage,
            triggeringUserId
        })
        assertActor(actor)

        if (!actorRepository.getActiveTransformationId(actor)) {
            return warnAndFail(
                "no-active-transformation",
                "Cannot change transformation stage: this actor has no active transformation."
            )
        }

        const target = Number(targetStage)
        if (!Number.isInteger(target) || target < 0) {
            return warnAndFail(
                "invalid-stage",
                `Cannot change transformation stage: '${targetStage}' is not a valid stage.`
            )
        }

        await tracker.whenIdle()

        let current = Number(actor.flags?.transformations?.stage ?? 0)
        if (!Number.isFinite(current)) current = 0

        while (current < target) {
            const next = current + 1
            await actor.update({ "flags.transformations.stage": next })
            await tracker.whenIdle()

            const reached = Number(actor.flags?.transformations?.stage ?? 0)
            if (reached !== next) {
                // A stage choice was cancelled (or the stage was rolled back); stop here.
                return { ok: false, reason: "stage-not-applied", stage: reached }
            }
            current = next
        }

        while (current > target) {
            if (current <= 1) {
                return warnAndFail(
                    "minimum-stage",
                    "Cannot change transformation stage: a transformation cannot be downgraded below stage 1. Remove the transformation instead."
                )
            }

            const result = await downgradeTransformationStage(actor, { triggeringUserId })
            await tracker.whenIdle()
            if (result?.ok === false) return result

            const reached = Number(actor.flags?.transformations?.stage ?? 0)
            if (reached >= current) {
                return { ok: false, reason: "stage-not-downgraded", stage: reached }
            }
            current = reached
        }

        return { ok: true, stage: current }
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
                diff?._id ?? null
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
                actor?.flags?.transformations?.type ?? null,
                actor?.flags?.transformations?.stage ?? null
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
        downgradeTransformationStage,
        changeTransformationType,
        changeTransformationStage,
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

    function warnAndFail(reason, message)
    {
        logger.warn(message)
        if (globalThis.__TRANSFORMATIONS_TEST__ !== true) {
            globalThis.ui?.notifications?.warn?.(message)
        }

        return {
            ok: false,
            reason,
            message
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
