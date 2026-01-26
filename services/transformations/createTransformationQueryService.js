export function createTransformationQueryService({
    transformationRegistry,
    compendiumRepository,
    transformationDefinitionFactory,
    transformationInstanceFactory
}) {

    async function getForActor(actor) {
        if (!actor) return null;

        const entry = transformationRegistry.getEntryForActor(actor);

        if (!entry) return null;

        const definition = await resolveDefinition(entry);

        if (!definition) return null;

        return transformationInstanceFactory.create({
            actor,
            definition,
            stage: actor.flags?.dnd5e?.transformationStage ?? 1,
            TransformationClass: entry.TransformationClass
        });
    }

    async function getDefinitionById(itemId) {
        if (!itemId) return null;

        const entry = transformationRegistry.getEntryByItemId(itemId);

        if (!entry) return null;

        return resolveDefinition(entry);
    }

    async function getAll() {
        const entries = transformationRegistry.getAllEntries();

        const results = await Promise.all(
            entries.map(async entry => {
                const definition = await resolveDefinition(entry);

                if (!definition) return null;

                return {
                    itemId: entry.itemId,
                    initialized: true,
                    definition
                };
            })
        );

        return results.filter(Boolean);
    }

    // ─────────────────────────────────────────────────────────────
    // Internal helper
    // ─────────────────────────────────────────────────────────────

    async function resolveDefinition(entry) {
        const item = await compendiumRepository.getDocumentByUuid(
            entry.uuid
        );

        if (!item) return null;

        return transformationDefinitionFactory.create({
            id: entry.itemId,
            uuid: entry.uuid,
            item,
            TransformationClass: entry.TransformationClass,
            stages: entry.TransformationStages,
            triggers: entry.TransformationTriggers
        });
    }

    return Object.freeze({
        getForActor,
        getDefinitionById,
        getAll
    });
}
