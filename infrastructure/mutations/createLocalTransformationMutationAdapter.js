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
                ...selectedChoices.map(selectedChoice => ({
                    ...selectedChoice
                }))
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
                        const sourceItem = await compendiumRepository.getDocumentByUuid(itemGrant.uuid)

                        if (!sourceItem) {
                            logger.warn("Missing item", itemGrant.uuid)
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

                        await itemRepository.addTransformationItem({
                            actor,
                            sourceItem,
                            replacesUuid: itemGrant.replacesUuid,
                            postCreateScript: itemGrant.postCreateScript,
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
}

