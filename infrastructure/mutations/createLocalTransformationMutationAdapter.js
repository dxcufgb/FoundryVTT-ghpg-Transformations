import {
    normalizeTransformationStageChoiceCount,
    normalizeTransformationStageChoiceSelection
} from "../../utils/transformationStageChoiceSelection.js"

export function createLocalTransformationMutationAdapter({
    tracker,
    actorRepository,
    getTransformationQueryService,
    itemRepository,
    creatureTypeService,
    compendiumRepository,
    stageGrantResolver,
    stageChoiceResolver,
    actionExecutor,
    activeEffectRepository,
    logger
})
{
    logger.debug("createLocalTransformationMutationAdapter", {
        tracker,
        actorRepository,
        getTransformationQueryService,
        itemRepository,
        creatureTypeService,
        compendiumRepository,
        stageGrantResolver,
        stageChoiceResolver,
        actionExecutor
    })

    async function applyTransformation({actorId, definition, stage = 0})
    {
        logger.debug("createLocalTransformationMutationAdapter.applyTransformation", {actorId, definition, stage})
        const actor = actorRepository.getById(actorId)
        if (!actor)
            return

        return tracker.track(
            (async () =>
            {
                await actorRepository.setTransformation(actor, definition.id, stage)
            })()
        )
    }

    async function initializeTransformation({
        actorId,
        definition,
        triggeringUserId = null
    })
    {
        logger.debug("createLocalTransformationMutationAdapter.initializeTransformation", {
            actorId,
            definition,
            triggeringUserId
        })
        const actor = actorRepository.getById(actorId)
        if (!actor)
            return

        const initialStage = 0
        return tracker.track(
            (async () =>
            {
                await applyStage(
                    actor,
                    definition,
                    initialStage,
                    null,
                    triggeringUserId
                )
            })()
        )
    }

    async function advanceStage({
        actorId,
        stage,
        choice = null,
        choices = [],
        triggeringUserId = null
    })
    {
        logger.debug("createLocalTransformationMutationAdapter.advanceStage", {
            actorId,
            stage,
            choice,
            choices,
            triggeringUserId
        })
        const actor = actorRepository.getById(actorId)
        if (!actor)
            return

        return tracker.track(
            (async () =>
            {
                const testVar = await getTransformationQueryService().getForActor(actor)
                const {definition} = await getTransformationQueryService().getForActor(actor)
                if (!definition)
                    return
                const selectedChoices =
                          normalizeSelectedChoices(choices).length > 0
                              ? choices
                              : choice == null
                                  ? []
                                  : [choice]

                await applyStage(
                    actor,
                    definition,
                    stage,
                    selectedChoices,
                    triggeringUserId
                )
                logger.debug(`settings finishedStage flag to ${stage}`)
                await actor.setFlag("transformations", "finishedStage", stage)
            })()
        )
    }

    async function clearTransformation({actorId})
    {
        logger.debug("createLocalTransformationMutationAdapter.clearTransformation", {actorId})
        const actor = actorRepository.getById(actorId)
        if (!actor)
            return

        return tracker.track(
            (async () =>
            {
                await creatureTypeService.restoreBaseCreatureType(actor)
                await itemRepository.removeTransformationItems(actor)
                await actorRepository.clearTransformation(actor)
                await activeEffectRepository.clearTransformation(actor)
            })()
        )
    }

    async function downgradeStage({
        actorId,
        transformationId = null,
        fromStage = null,
        toStage = null
    })
    {
        logger.debug("createLocalTransformationMutationAdapter.downgradeStage", {
            actorId,
            transformationId,
            fromStage,
            toStage
        })
        const actor = actorRepository.getById(actorId)
        if (!actor)
            return

        return tracker.track(
            (async () =>
            {
                const activeTransformationId =
                          actor.flags?.transformations?.type ?? null
                if (!activeTransformationId) {
                    logger.warn(
                        "Cannot downgrade transformation stage: actor has no active transformation",
                        actorId
                    )
                    return {
                        ok: false,
                        reason: "no-active-transformation"
                    }
                }

                if (
                    transformationId &&
                    transformationId !== activeTransformationId
                ) {
                    logger.warn(
                        "Cannot downgrade transformation stage: active transformation changed",
                        {
                            actorId,
                            requested: transformationId,
                            active: activeTransformationId
                        }
                    )
                    return {
                        ok: false,
                        reason: "transformation-changed"
                    }
                }

                const currentStage = Number(
                    actor.flags?.transformations?.stage ?? 0
                )
                if (!Number.isFinite(currentStage) || currentStage <= 1) {
                    logger.warn(
                        "Cannot downgrade transformation stage: actor is already at the minimum stage",
                        {
                            actorId,
                            currentStage
                        }
                    )
                    return {
                        ok: false,
                        reason: "minimum-stage"
                    }
                }

                if (fromStage != null && Number(fromStage) !== currentStage) {
                    logger.warn(
                        "Transformation downgrade stage mismatch; using current actor stage",
                        {
                            actorId,
                            requested: fromStage,
                            currentStage
                        }
                    )
                }

                const targetStage = currentStage - 1
                if (toStage != null && Number(toStage) !== targetStage) {
                    logger.warn(
                        "Transformation downgrade target mismatch; downgrading by one stage",
                        {
                            actorId,
                            requested: toStage,
                            targetStage
                        }
                    )
                }
                const transformation =
                          await getTransformationQueryService().getForActor(actor)
                const {definition} = transformation ?? {}
                if (!definition) {
                    logger.warn(
                        "Cannot downgrade transformation stage: definition not found",
                        activeTransformationId
                    )
                    return {
                        ok: false,
                        reason: "missing-definition"
                    }
                }

                const removedItems =
                          itemRepository.getTransformationItemsForStage?.(
                              actor,
                              {
                                  definitionId: definition.id,
                                  stage: currentStage
                              }
                          ) ?? []
                const restorationPlan = buildReplacementRestorationPlan({
                    actor,
                    definition,
                    removedStage: currentStage,
                    targetStage,
                    removedItems
                })

                await activeEffectRepository.removeTransformationEffectsForStage?.(
                    actor,
                    {
                        definitionId: definition.id,
                        stage: currentStage,
                        origins: getItemOrigins(removedItems)
                    }
                )
                await itemRepository.removeTransformationItemsForStage?.(
                    actor,
                    {
                        definitionId: definition.id,
                        stage: currentStage
                    }
                )
                await actorRepository.clearTransformationStageChoice?.(
                    actor,
                    definition.id,
                    currentStage
                )
                await reconcileTransformationScopedStageFlags({
                    actor,
                    definition,
                    removedStage: currentStage,
                    targetStage
                })
                await actorRepository.setTransformationStage(
                    actor,
                    targetStage,
                    {
                        finishedStage: targetStage
                    }
                )
                await restoreReplacedItems({
                    actor,
                    definition,
                    restorationPlan
                })

                return {
                    ok: true,
                    transformationId: definition.id,
                    previousStage: currentStage,
                    stage: targetStage
                }
            })()
        )
    }

    async function applyTriggerActions(payload)
    {
        logger.debug("createLocalTransformationMutationAdapter.applyTriggerActions", {payload})
        return tracker.track(
            (async () =>
            {
                await actionExecutor.execute({
                    actorId: payload.actorId,
                    actions: payload.actions,
                    context: payload.context,
                    variables: payload.variables,
                    handlers: payload.handlers
                })
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        applyTransformation,
        initializeTransformation,
        advanceStage,
        downgradeStage,
        clearTransformation,
        applyTriggerActions
    })

    async function applyStage(
        actor,
        definition,
        stage,
        choices = [],
        triggeringUserId = null
    )
    {
        logger.debug("createLocalTransformationMutationAdapter.applyStage", {
            actor,
            definition,
            stage,
            choices,
            triggeringUserId
        })
        if (stage != 0) {
            const grants = stageGrantResolver.resolve({
                actor,
                definition,
                stage
            }) ?? {
                items: [],
                creatureSubType: null,
                transformationFlags: null
            }

            const selectedChoices = normalizeSelectedChoices(choices)
            grants.items.push(
                ...selectedChoices.map(selectedChoice =>
                    normalizeItemGrant({
                        ...selectedChoice,
                        grantType: selectedChoice.grantType ?? "choice"
                    })
                )
            )

            return tracker.track(
                (async () =>
                {
                    const selectedChoiceUuids = new Set(
                        selectedChoices
                        .map(selectedChoice => selectedChoice?.uuid)
                        .filter(uuid => typeof uuid === "string")
                    )

                    for (const itemGrant of grants.items) {
                        const normalizedGrant = normalizeItemGrant(itemGrant)
                        const sourceItem =
                                  await compendiumRepository.getDocumentByUuid(
                                      normalizedGrant.uuid
                                  )

                        if (!sourceItem) {
                            logger.warn("Missing item", normalizedGrant.uuid)
                            continue
                        }

                        if (
                            globalThis?.__TRANSFORMATIONS_TEST__ !== true &&
                            !selectedChoiceUuids.has(sourceItem.uuid)
                        ) {
                            await game.transformations
                            .getDialogFactory()
                            .showItemInfoDialog({
                                item: sourceItem,
                                triggeringUserId
                            })
                        }

                        const removeAwardedByReplacedItem =
                                  normalizedGrant.replacesUuid
                                      ? normalizedGrant.removeAwardedByReplacedItem
                                      : undefined

                        await itemRepository.addTransformationItem({
                            actor,
                            sourceItem,
                            replacesUuid: normalizedGrant.replacesUuid,
                            removeAwardedByReplacedItem:
                                removeAwardedByReplacedItem,
                            postCreateScript: normalizedGrant.postCreateScript,
                            createOptions: {
                                transformationGrant: {
                                    transformationId: definition.id,
                                    stage,
                                    sourceUuid: normalizedGrant.uuid,
                                    grantType: normalizedGrant.grantType,
                                    replacesUuid:
                                        normalizedGrant.replacesUuid,
                                    removeAwardedByReplacedItem:
                                        removeAwardedByReplacedItem
                                }
                            },
                            triggeringUserId
                        })
                    }

                    if (grants.creatureSubType) {
                        await creatureTypeService.applyCreatureSubType(actor, grants.creatureSubType)
                    }
                    if (grants.transformationFlags) {
                        await actorRepository.mergeTransformationScopedFlags(
                            actor,
                            definition.id,
                            grants.transformationFlags
                        )
                    }
                    logger.debug(`settings finishedStage flag to ${stage}`)
                    await actor.setFlag("transformations", "finishedStage", stage)
                })()
            )
        }
        logger.debug(`settings finishedStage flag to ${stage}`)
        await actor.setFlag("transformations", "finishedStage", stage)
    }

    function normalizeSelectedChoices(choices = [])
    {
        return (Array.isArray(choices) ? choices : [choices]).filter(choice =>
            choice && typeof choice.uuid === "string" && choice.uuid.length > 0
        )
    }

    function normalizeItemGrant(grant = {})
    {
        const replacesUuid = normalizeUuidReference(
            grant.replacesUuid ?? grant.replaces
        )

        return {
            ...grant,
            uuid: grant.uuid,
            replacesUuid,
            grantType:
                grant.grantType ??
                (replacesUuid ? "replacement" : "stage"),
            removeAwardedByReplacedItem:
                resolveRemoveAwardedByReplacedItem(grant),
            postCreateScript: grant.postCreateScript ?? null
        }
    }

    function resolveRemoveAwardedByReplacedItem(grant = {})
    {
        if (grant.removeAwardedByReplacedItem != null) {
            return grant.removeAwardedByReplacedItem !== false
        }

        if (
            grant.replaces &&
            typeof grant.replaces === "object" &&
            grant.replaces.removeAwardedItems != null
        ) {
            return grant.replaces.removeAwardedItems !== false
        }

        return true
    }

    function normalizeUuidReference(reference)
    {
        if (!reference) return null
        if (typeof reference === "string") return reference

        return reference.uuid ?? null
    }

    function getItemOrigins(items = [])
    {
        const origins = new Set()

        for (const item of items) {
            for (const value of [
                item?.uuid,
                item?.id,
                item?.flags?.core?.sourceId,
                item?.flags?.transformations?.sourceUuid
            ]) {
                if (typeof value === "string" && value.length > 0) {
                    origins.add(value)
                }
            }
        }

        return [...origins]
    }

    function buildReplacementRestorationPlan({
        actor,
        definition,
        removedStage,
        targetStage,
        removedItems = []
    })
    {
        logger.debug("createLocalTransformationMutationAdapter.buildReplacementRestorationPlan", {
            actor,
            definition,
            removedStage,
            targetStage,
            removedItems
        })
        const replacementEntries = new Map()
        const removedSourceUuids = new Set(
            removedItems
            .map(item => item?.flags?.transformations?.sourceUuid)
            .filter(uuid => typeof uuid === "string" && uuid.length > 0)
        )

        for (const item of removedItems) {
            const replacesUuid =
                      item?.flags?.transformations?.grantedBy?.replacesUuid
            if (typeof replacesUuid === "string" && replacesUuid.length > 0) {
                replacementEntries.set(replacesUuid, {
                    sourceUuid: replacesUuid,
                    applyAdvancements:
                        item?.flags?.transformations?.grantedBy
                        ?.removeAwardedByReplacedItem !== false
                })
            }
        }

        for (const grant of getStageItemGrantDefinitions({
            actor,
            definition,
            stage: removedStage
        })) {
            if (!removedSourceUuids.has(grant.uuid)) continue
            if (grant.replacesUuid) {
                replacementEntries.set(grant.replacesUuid, {
                    sourceUuid: grant.replacesUuid,
                    applyAdvancements:
                        grant.removeAwardedByReplacedItem !== false
                })
            }
        }

        return [...replacementEntries.values()].flatMap(entry =>
        {
            const restoreStage = findRetainedStageForSourceUuid({
                actor,
                definition,
                sourceUuid: entry.sourceUuid,
                targetStage
            })

            if (restoreStage == null) return []

            return [{
                sourceUuid: entry.sourceUuid,
                stage: restoreStage,
                applyAdvancements: entry.applyAdvancements
            }]
        })
    }

    async function restoreReplacedItems({
        actor,
        definition,
        restorationPlan = []
    })
    {
        logger.debug("createLocalTransformationMutationAdapter.restoreReplacedItems", {
            actor,
            definition,
            restorationPlan
        })

        for (const entry of restorationPlan) {
            if (actor.items.some(item =>
                item.flags?.transformations?.sourceUuid === entry.sourceUuid
            )) {
                continue
            }

            const sourceItem =
                      await compendiumRepository.getDocumentByUuid(
                          entry.sourceUuid
                      )
            if (!sourceItem) {
                logger.warn(
                    "Could not restore replaced transformation item; source item missing",
                    entry.sourceUuid
                )
                continue
            }

            await itemRepository.addTransformationItem({
                actor,
                sourceItem,
                createOptions: {
                    transformationGrant: {
                        transformationId: definition.id,
                        stage: entry.stage,
                        sourceUuid: entry.sourceUuid,
                        grantType: "restored-replacement"
                    },
                    applyAdvancements: entry.applyAdvancements !== false
                }
            })
        }
    }

    function findRetainedStageForSourceUuid({
        actor,
        definition,
        sourceUuid,
        targetStage
    })
    {
        for (let stage = targetStage; stage >= 1; stage -= 1) {
            const grants = getStageItemGrantDefinitions({
                actor,
                definition,
                stage
            })

            if (grants.some(grant => grant.uuid === sourceUuid)) {
                return stage
            }
        }

        return null
    }

    function getStageItemGrantDefinitions({
        actor,
        definition,
        stage
    })
    {
        const stageDef =
                  definition?.stages?.get?.(stage) ??
                  definition?.stages?.[stage]
        if (!stageDef) return []

        const directGrants =
                  (stageDef.grants?.items ?? []).map(normalizeItemGrant)
        const selectedChoiceGrants = getSelectedStageChoiceUuids({
            actor,
            definition,
            stage,
            stageDef
        }).flatMap(choiceUuid =>
            (stageDef.choices?.items ?? [])
            .filter(choice => choice.uuid === choiceUuid)
            .map(choice => normalizeItemGrant({
                ...choice,
                grantType: "choice"
            }))
        )

        return [
            ...directGrants,
            ...selectedChoiceGrants
        ]
    }

    function getSelectedStageChoiceUuids({
        actor,
        definition,
        stage,
        stageDef
    })
    {
        const choiceCount = normalizeTransformationStageChoiceCount(
            stageDef?.choices?.count
        )
        const selection =
                  actor.getFlag("transformations", "stageChoices")
                  ?.[definition.id]
                  ?.[stage]

        return normalizeTransformationStageChoiceSelection(
            selection,
            choiceCount
        )
    }

    async function reconcileTransformationScopedStageFlags({
        actor,
        definition,
        removedStage,
        targetStage
    })
    {
        logger.debug("createLocalTransformationMutationAdapter.reconcileTransformationScopedStageFlags", {
            actor,
            definition,
            removedStage,
            targetStage
        })
        const managedPaths = new Set()
        const targetFlags = {}

        for (let stage = 1; stage <= removedStage; stage += 1) {
            const stageDef =
                      definition?.stages?.get?.(stage) ??
                      definition?.stages?.[stage]
            const flags = stageDef?.grants?.actor?.flags

            for (const path of flattenFlagPaths(flags)) {
                managedPaths.add(path)
            }

            if (stage <= targetStage) {
                mergePlainObject(targetFlags, flags)
            }
        }

        if (!managedPaths.size) return

        const set = flattenFlagValues(targetFlags)
        const unset = [...managedPaths].filter(path => !(path in set))

        await actorRepository.updateTransformationScopedFlagPaths?.(
            actor,
            definition.id,
            {
                set,
                unset
            }
        )
    }

    function mergePlainObject(target, source)
    {
        if (!source || typeof source !== "object" || Array.isArray(source)) {
            return target
        }

        for (const [key, value] of Object.entries(source)) {
            if (
                value &&
                typeof value === "object" &&
                !Array.isArray(value)
            ) {
                target[key] ??= {}
                mergePlainObject(target[key], value)
                continue
            }

            target[key] = value
        }

        return target
    }

    function flattenFlagPaths(value, prefix = "")
    {
        return Object.keys(flattenFlagValues(value, prefix))
    }

    function flattenFlagValues(value, prefix = "")
    {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return {}
        }

        return Object.entries(value).reduce((flattened, [key, entry]) =>
        {
            const path = prefix ? `${prefix}.${key}` : key

            if (
                entry &&
                typeof entry === "object" &&
                !Array.isArray(entry)
            ) {
                Object.assign(flattened, flattenFlagValues(entry, path))
            } else {
                flattened[path] = entry
            }

            return flattened
        }, {})
    }
}

