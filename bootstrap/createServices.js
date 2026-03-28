// bootstrap/createServices.js

import { registerTransformations } from "../domain/transformation/manifest.js"
import { createTransformationDefinitionFactory } from "../domain/transformation/createTransformationDefinitionFactory.js"
import { createTransformationInstanceFactory } from "../domain/transformation/createTransformationInstanceFactory.js"
import { createActorQueryService } from "../services/actor/createActorQueryService.js"
import { createRollTableEffectResolver } from "../services/rollTables/createRollTableEffectResolver.js"
import { createTransformationQueryService } from "../services/transformations/createTransformationQueryService.js"
import { createTransformationRegistry } from "../services/transformations/createTransformationRegistry.js"
import { createTransformationService } from "../services/transformations/createTransformationServices.js"
import { createTriggerRuntime } from "../services/triggers/createTriggerRuntime.js"
import { createRollTableEffectCatalog } from "../services/rollTables/createRollTableEffectCatalog.js"
import { createTransformationMutationGateway } from "../infrastructure/foundry/TransformationMutationGateway.js"
import { createActionHandlers } from "../services/actions/handlers/index.js"
import { createTriggerVariableResolver } from "../services/triggers/createTriggerVariableResolver.js"
import { createFormulaEvaluator } from "../services/formulas/createFormulaEvaluator.js"
import { createStageChoiceResolver } from "../domain/transformation/createStageChoiceResolver.js"
import { createApplyFiendGiftOfDamnation } from "../services/transformations/createApplyFiendGiftOfDamnation.js"
import { RollService } from "../services/rolls/RollService.js";
import { UiAccessor } from "./uiAccessor.js"

export function createServices({
    getGame,
    dependencies,
    infrastructure,
    triggerNotification
})
{
    dependencies.logger.debug("createServices", {
        dependencies,
        infrastructure,
        triggerNotification
    })

    const {utils, logger, constants} = dependencies
    const {
              actorRepository,
              chatService,
              directMacroInvoker,
              activeEffectRepository,
              rollTableService,
              itemRepository,
              compendiumRepository,
              actionExecutor,
              socketGateway,
              localMutationAdapter,
              notifier,
              requiresService,
              advancementChoiceHandler
          } = infrastructure
    const trackers = {
        repositories: utils.asyncTrackers.get("repositories"),
        mutations: utils.asyncTrackers.get("mutations"),
        sockets: utils.asyncTrackers.get("sockets"),
        macros: utils.asyncTrackers.get("macros"),
        ui: utils.asyncTrackers.get("ui"),
        services: utils.asyncTrackers.get("services")
    }

    const transformationRegistry = createTransformationRegistry({logger})
    registerTransformations(transformationRegistry, logger)

    // TODO: fix createRollEffectCatalog
    const rollTableEffectCatalog = createRollTableEffectCatalog({
        transformationRegistry,
        activeEffectRepository,
        constants,
        effectChangeBuilder: utils.effectChangeBuilder,
        chatService,
        actorRepository,
        logger
    })

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
    })

    const transformationQueryService = createTransformationQueryService({
        tracker: trackers.services,
        transformationRegistry,
        compendiumRepository,
        transformationDefinitionFactory,
        transformationInstanceFactory,
        logger
    })

    const actorQueryService = createActorQueryService({
        actorRepository,
        logger
    })

    const actionHandlers = createActionHandlers({
        trackers,
        getGame,
        directMacroInvoker,
        activeEffectRepository,
        actorRepository,
        itemRepository,
        rollTableService,
        rollTableEffectResolver,
        logger
    })

    const transformationMutationGateway = createTransformationMutationGateway({
        tracker: trackers.mutations,
        socketGateway,
        localMutationAdapter,
        actionExecutor,
        actionHandlers,
        notifier,
        logger
    })

    const formulaEvaluator = createFormulaEvaluator({
        logger
    })

    const variableResolver = createTriggerVariableResolver({
        actorRepository,
        formulaEvaluator,
        logger
    })

    const stageChoiceResolver = createStageChoiceResolver({
        tracker: trackers.services,
        compendiumRepository,
        requiresService,
        logger
    })

    const applyFiendGiftOfDamnation = createApplyFiendGiftOfDamnation({
        tracker: trackers.services,
        activeEffectRepository,
        actorRepository,
        advancementChoiceHandler,
        itemRepository,
        getDialogFactory: () => UiAccessor.dialogs,
        logger
    })

    const transformationService = createTransformationService({
        tracker: trackers.services,
        actorRepository,
        mutationGateway: transformationMutationGateway,
        transformationQueryService,
        variableResolver,
        stageChoiceResolver,
        logger
    })

    const triggerRuntime = createTriggerRuntime({
        tracker: trackers.services,
        transformationService,
        logger
    })

    return Object.freeze({
        transformationRegistry,
        transformationQueryService,
        transformationService,
        rollTableEffectCatalog,
        rollTableEffectResolver,
        triggerRuntime,
        actorQueryService,
        transformationMutationGateway,
        applyFiendGiftOfDamnation,
        RollService
    })
}
