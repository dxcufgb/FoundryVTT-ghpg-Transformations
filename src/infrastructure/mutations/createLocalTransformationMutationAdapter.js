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

    async function applyTransformation({ actorId, definition, stage = 0 })
    {
        logger.debug("createLocalTransformationMutationAdapter.applyTransformation", { actorId, definition, stage })
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

    async function initializeTransformation({ actorId, definition })
    {
        logger.debug("createLocalTransformationMutationAdapter.initializeTransformation", { actorId, definition })
        const actor = actorRepository.getById(actorId)
        if (!actor)
            return

        const initialStage = 0
        return tracker.track(
            (async () =>
            {
                await applyStage(actor, definition, initialStage)
            })()
        )
    }

    async function advanceStage({ actorId, stage, choice = null })
    {
        logger.debug("createLocalTransformationMutationAdapter.advanceStage", { actorId, stage, choice })
        const actor = actorRepository.getById(actorId)
        if (!actor)
            return

        return tracker.track(
            (async () =>
            {
                const { definition } = await getTransformationQueryService().getForActor(actor)
                if (!definition)
                    return

                await applyStage(actor, definition, stage, choice)
            })()
        )
    }

    async function clearTransformation({ actorId })
    {
        logger.debug("createLocalTransformationMutationAdapter.clearTransformation", { actorId })
        const actor = actorRepository.getById(actorId)
        if (!actor)
            return

        return tracker.track(
            (async () =>
            {
                await creatureTypeService.restoreBaseCreatureType(actor)
                await itemRepository.removeTransformationItems(actor)
                await actorRepository.clearTransformation(actor)
            })()
        )
    }

    async function applyTriggerActions(payload)
    {
        logger.debug("createLocalTransformationMutationAdapter.applyTriggerActions", { payload })
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

    async function applyStage(actor, definition, stage, choice)
    {
        logger.debug("createLocalTransformationMutationAdapter.applyStage", { actor, definition, stage, choice })
        if (stage != 0) {
            const grants = stageGrantResolver.resolve({
                definition,
                stage
            })

            if (choice != null) {
                grants.items.push({ uuid: choice })
            }

            return tracker.track(
                (async () =>
                {

                    for (const itemGrant of grants.items) {
                        const sourceItem = await compendiumRepository.getDocumentByUuid(itemGrant.uuid)

                        if (!sourceItem) {
                            logger.warn("Missing item", itemGrant.uuid)
                            continue
                        }


                        await itemRepository.addTransformationItem({
                            actor,
                            sourceItem,
                            context: {
                                definitionId: definition.id,
                                stage
                            },
                            replacesUuid: itemGrant.replacesUuid
                        })
                    }

                    if (grants.creatureSubType) {
                        await creatureTypeService.applyCreatureSubType(actor, grants.creatureSubType)
                    }
                })()
            )
        }
        actor.setFlag("transformations", "finishedStage", stage)
    }
}
