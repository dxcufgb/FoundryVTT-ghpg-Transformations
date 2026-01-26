// bootstrap/createServices.js

import { registerTransformations } from "../domain/transformation/manifest.js";
import { createTransformationDefinitionFactory } from "../domain/transformation/createTransformationDefinitionFactory.js";
import { createTransformationInstanceFactory } from "../domain/transformation/createTransformationInstanceFactory.js";
import { createActorQueryService } from "../services/actor/createActorQueryService.js";
import { createRollTableEffectResolver } from "../services/rollTables/createRollTableEffectResolver.js";
import { createTransformationQueryService } from "../services/transformations/createTransformationQueryService.js";
import { createTransformationRegistry } from "../services/transformations/createTransformationRegistry.js";
import { createTransformationService } from "../services/transformations/createTransformationServices.js";
import { createTriggerRuntime } from "../services/triggers/createTriggerRuntime.js";
import { createRollTableEffectCatalog } from "../services/rollTables/createRollTableEffectCatalog.js";
import { createTransformationMutationGateway } from "../infrastructure/foundry/TransformationMutationGateway.js";
import { createActionHandlers } from "../services/actions/handlers/index.js";
import { createTriggerVariableResolver } from "../services/triggers/createTriggerVariableResolver.js";
import { createFormulaEvaluator } from "../services/formulas/createFormulaEvaluator.js";
import { bootstrapMacros } from "../macros/createMacros.js";

export function createServices({
    dependencies,
    infrastructure
}) {
    const { utils, logger, constants } = dependencies;
    const { actorRepository, chatService, directMacroInvoker, activeEffectRepository, rollTableService, itemRepository, compendiumRepository, actionExecutor, socketGateway, localMutationAdapter } = infrastructure;
    // ─────────────────────────────────────────────────────────────
    // Domain registries (pure, no Foundry)
    // ─────────────────────────────────────────────────────────────

    const transformationRegistry = createTransformationRegistry();
    registerTransformations(transformationRegistry);

    // ─────────────────────────────────────────────────────────────
    // Application services (orchestration only)
    // ─────────────────────────────────────────────────────────────
    // TODO: fix createRollEffectCatalog
    const rollTableEffectCatalog = createRollTableEffectCatalog({
        transformationRegistry,
        activeEffectRepository,
        constants,
        effectChangeBuilder: utils.effectChangeBuilder,
        chatService,
        actorRepository,
        logger
    });

    const rollTableEffectResolver = createRollTableEffectResolver({
        constants,
        activeEffectRepository,
        rollTableEffectCatalog,
        effectChangeBuilder: utils.effectChangeBuilder,
        chatService,
        actorRepository,
        stringUtils: utils.stringUtils,
        moduleFolderPath: constants.MODULE_FOLDER,
        logger
    })

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

    const actionHandlers = createActionHandlers({
        directMacroInvoker,
        activeEffectRepository,
        actorRepository,
        itemRepository,
        rollTableService,
        rollTableEffectResolver,
        logger
    });

    const transformationMutationGateway = createTransformationMutationGateway({
        socketGateway,
        localMutationAdapter,
        actionExecutor,
        actionHandlers,
        logger
    });

    const formulaEvaluator = createFormulaEvaluator({
        logger
    })

    const variableResolver = createTriggerVariableResolver({
        formulaEvaluator,
        logger
    })

    const transformationService = createTransformationService({
        actorRepository,
        mutationGateway: transformationMutationGateway,
        transformationQueryService,
        variableResolver,
        logger
    });

    const triggerRuntime = createTriggerRuntime({
        transformationRegistry,
        transformationQueryService,
        transformationService,
        actionHandlers,
        logger
    });

    // ─────────────────────────────────────────────────────────────
    // Public service surface (immutable)
    // ─────────────────────────────────────────────────────────────

    return Object.freeze({
        transformationRegistry,
        transformationQueryService,
        transformationService,
        rollTableEffectCatalog,
        rollTableEffectResolver,
        triggerRuntime,
        actorQueryService,
        transformationMutationGateway
    });
}
