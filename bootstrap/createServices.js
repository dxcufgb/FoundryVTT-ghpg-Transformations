// bootstrap/createServices.js

import { createTransformationDefinitionFactory } from "../domain/transformation/createTransformationDefinitionFactory.js";
import { createTransformationInstanceFactory } from "../domain/transformation/createTransformationInstanceFactory.js";
import { createActorQueryService } from "../services/createActorQueryService.js";
import { createTransformationQueryService } from "../services/createTransformationQueryService.js";
import { createTransformationRegistry } from "../services/createTransformationRegistry.js";
import { createTransformationService } from "../services/createTransformationServices.js";

export function createServices({
    dependencies,
    infrastructure
}) {
    const { utils, logger, constants } = dependencies;
    const { actorRepository, itemRepository, compendiumRepository, transformationMutationGateway } = infrastructure;
    // ─────────────────────────────────────────────────────────────
    // Domain registries (pure, no Foundry)
    // ─────────────────────────────────────────────────────────────

    const transformationRegistry = createTransformationRegistry();

    // ─────────────────────────────────────────────────────────────
    // Application services (orchestration only)
    // ─────────────────────────────────────────────────────────────

    const transformationInstanceFactory = createTransformationInstanceFactory({
        utils,
        logger
    })

    const transformationDefinitionFactory = createTransformationDefinitionFactory({
        transformationRegistry: transformationRegistry,
        logger
    });

    const transformationQueryService = createTransformationQueryService({
        transformationRegistry,
        compendiumRepository,
        transformationDefinitionFactory,
        transformationInstanceFactory
    });

    const actorQueryService = createActorQueryService({
        actorRepository
    });

    const transformationService = createTransformationService({
        actorRepository,
        mutationGateway: transformationMutationGateway,
        transformationQueryService,
        logger
    });

    // ─────────────────────────────────────────────────────────────
    // Public service surface (immutable)
    // ─────────────────────────────────────────────────────────────

    return Object.freeze({
        transformationRegistry,
        transformationQueryService,
        transformationService,
        actorQueryService
    });
}
