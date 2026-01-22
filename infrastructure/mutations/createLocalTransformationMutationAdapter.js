export function createLocalTransformationMutationAdapter({
    actorRepository,
    itemRepository,
    creatureTypeService,
    compendiumRepository,
    stageGrantResolver,
    effectService,
    rollTableService,
    applyActions,
    logger
}) {

    // ─────────────────────────────────────────────────────────────
    // Gateway command implementations
    // ─────────────────────────────────────────────────────────────

    async function applyTransformation({ actorId, definitionId, stage = 1 }) {
        const actor = actorRepository.getById(actorId);
        if (!actor) return;

        const definition = await transformationQueryService.getDefinitionById(definitionId);

        // Set flags first (single source of truth)
        await actorRepository.setTransformation(
            actor,
            definition.id,
            stage
        );

        await applyStage(actor, definition, stage);
    }

    async function initializeTransformation({ actorId, definition }) {
        const actor = actorRepository.getById(actorId);
        if (!actor) return;

        const initialStage = 1;
        await applyStage(actor, definition, initialStage);
    }

    async function advanceStage({ actorId, stage }) {
        const actor = actorRepository.getById(actorId);
        if (!actor) return;

        const definition =
            await actorRepository.getActiveTransformationDefinition(actor);

        if (!definition) return;

        await applyStage(actor, definition, stage);
    }

    async function clearTransformation({ actorId }) {
        const actor = actorRepository.getById(actorId);
        if (!actor) return;

        await creatureTypeService.restoreBaseCreatureType(actor);
        await itemRepository.removeTransformationItems(actor);
        await actorRepository.clearTransformation(actor);
    }

    async function applyTriggerActions(payload) {
        return applyActions(
            payload,
            { actorRepository, effectService, rollTableService },
            { logger }
        );
    }

    return Object.freeze({
        applyTransformation,
        initializeTransformation,
        advanceStage,
        clearTransformation,
        applyTriggerActions
    });

    // ─────────────────────────────────────────────────────────────
    // Internal helper
    // ─────────────────────────────────────────────────────────────

    async function applyStage(actor, definition, stage) {
        const grants =
            stageGrantResolver.resolve({ definition, stage });

        for (const itemGrant of grants.items) {
            const sourceItem =
                await compendiumRepository.getDocumentByUuid(
                    itemGrant.uuid
                );

            if (!sourceItem) {
                logger.warn("Missing item", itemGrant.uuid);
                continue;
            }

            await itemRepository.addTransformationItem({
                actor,
                sourceItem,
                context: {
                    definitionId: definition.id,
                    stage
                },
                replacesUuid: itemGrant.replacesUuid,
                isPrerequisite: itemGrant.isPrerequisite
            });
        }

        if (grants.creatureSubType) {
            await creatureTypeService.applyCreatureSubType(
                actor,
                grants.creatureSubType
            );
        }
    }
}
