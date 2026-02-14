export function createTransformationQueryService({
    tracker,
    transformationRegistry,
    compendiumRepository,
    transformationDefinitionFactory,
    transformationInstanceFactory,
    logger
})
{
    logger.debug("createTransformationQueryService", {
        tracker,
        transformationRegistry,
        compendiumRepository,
        transformationDefinitionFactory,
        transformationInstanceFactory
    })

    async function getForActor(actor)
    {
        logger.debug("createTransformationQueryService.getForActor", { actor })
        if (!actor) return null

        const entry = transformationRegistry.getEntryForActor(actor)

        if (!entry) return null

        return tracker.track(
            (async () =>
            {
                const definition = await resolveDefinition(entry)

                if (!definition) return null

                return transformationInstanceFactory.create({
                    actor,
                    definition,
                    stage: actor.flags?.transformations?.stage ?? 0,
                    TransformationClass: entry.TransformationClass
                })
            })()
        )
    }

    function getDefinitionById(itemId)
    {
        logger.debug("createTransformationQueryService.getDefinitionById", { itemId })
        if (!itemId) return null

        const entry = transformationRegistry.getEntryByItemId(itemId)

        if (!entry) return null

        return resolveDefinition(entry)
    }

    async function getAll()
    {
        logger.debug("createTransformationQueryService.getAll", {})
        return tracker.track(
            (async () =>
            {
                const entries = transformationRegistry.getAllEntries()

                const results = await Promise.all(
                    entries.map(async entry =>
                    {
                        const definition = await resolveDefinition(entry)

                        if (!definition) return null

                        return {
                            itemId: entry.itemId,
                            initialized: true,
                            definition
                        }
                    })
                )

                return results.filter(Boolean)
            })()
        )
    }

    async function resolveDefinition(entry)
    {
        logger.debug("createTransformationQueryService.resolveDefinition", { entry })
        return tracker.track(
            (async () =>
            {
                const item = await compendiumRepository.getDocumentByUuid(
                    entry.uuid
                )

                if (!item) return null

                return transformationDefinitionFactory.create({
                    id: entry.itemId,
                    uuid: entry.uuid,
                    item,
                    TransformationClass: entry.TransformationClass,
                    stages: entry.TransformationStages,
                    triggers: entry.TransformationTriggers
                })
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        getForActor,
        getDefinitionById,
        getAll
    })
}
