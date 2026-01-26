export function createLocalTransformationMutationAdapter({
    actorRepository,
    itemRepository,
    creatureTypeService,
    compendiumRepository,
    stageGrantResolver,
    actionExecutor,
    logger
}) {

    // ─────────────────────────────────────────────────────────────
    // Gateway command implementations
    // ─────────────────────────────────────────────────────────────

    async function applyTransformation({ actorId, definition, stage = 1 }) {
        const actor = actorRepository.getById(actorId);
        if (!actor) return;

        // Set flags first (single source of truth)
        await actorRepository.setTransformation(
            actor,
            definition.id,
            stage
        );
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

        const definition = await actorRepository.getActiveTransformationDefinition(actor);

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
        await actionExecutor.execute({
            actorId: payload.actorId,
            actions: payload.actions,
            context: payload.context,
            variables: payload.variables,
            handlers: payload.handlers
        });
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
