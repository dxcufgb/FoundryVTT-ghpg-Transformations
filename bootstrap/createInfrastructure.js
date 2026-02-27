import { createStageGrantResolver } from "../domain/transformation/createStageGrantResolver.js"
import { createActiveEffectRepository } from "../infrastructure/foundry/activeEffectsRepository.js"
import { createActorRepository } from "../infrastructure/foundry/actorRepository.js"
import { createCompendiumRepository } from "../infrastructure/foundry/compendiumRepository.js"
import { createCreatureTypeService } from "../infrastructure/foundry/creatureSubTypeService.js"
import { createItemRepository } from "../infrastructure/foundry/itemRepository.js"
import { createTokenRepository } from "../infrastructure/foundry/tokenRepository.js"
import { createLocalTransformationMutationAdapter } from "../infrastructure/mutations/createLocalTransformationMutationAdapter.js"
import { createSocketGateway } from "../infrastructure/socket/createSocketGateway.js"
import { createMacroRegistry } from "../macros/macroRegistry.js"
import { createDirectMacroInvoker } from "../macros/createDirectMacroInvoker.js"
import { createRollTableService } from "../infrastructure/rolltables/createRollTableService.js"
import { createActionExecutor } from "../infrastructure/actions/createActionExecutor.js"
import { createChatService } from "../infrastructure/foundry/createChatService.js"
import { createNotifier } from "../infrastructure/foundry/createNotifier.js"
import { createOnceService } from "../infrastructure/foundry/createOnceService.js"

export function createInfrastructure({
    getGame,
    logger,
    dependencies,
    getTransformationQueryService,
    getExecutor,
    notifications
})
{
    logger.debug("createInfrastructure", {
        getGame,
        dependencies,
        getTransformationQueryService,
        getExecutor,
        notifications
    })

    const { utils, constants } = dependencies
    const trackers = {
        repositories: utils.asyncTrackers.get("repositories"),
        mutations: utils.asyncTrackers.get("mutations"),
        sockets: utils.asyncTrackers.get("sockets"),
        macros: utils.asyncTrackers.get("macros"),
        ui: utils.asyncTrackers.get("ui"),
        services: utils.asyncTrackers.get("services")
    }
    const debouncedTracker = utils.asyncTrackers.debounced

    const onceService = createOnceService({
        logger
    })

    const chatService = createChatService({
        tracker: trackers.ui,
        logger
    })

    const actorRepository = createActorRepository({
        tracker: trackers.repositories,
        debouncedTracker,
        getGame,
        logger
    })
    const tokenRepository = createTokenRepository({
        tracker: trackers.repositories,
        debouncedTracker,
        logger
    })
    const itemRepository = createItemRepository({
        tracker: trackers.repositories,
        debouncedTracker,
        logger
    })
    const activeEffectRepository = createActiveEffectRepository({
        tracker: trackers.repositories,
        debouncedTracker,
        logger
    })

    const stageGrantResolver = createStageGrantResolver({ logger })
    const creatureTypeService = createCreatureTypeService({
        tracker: trackers.mutations,
        debouncedTracker,
        actorRepository,
        itemRepository,
        utils,
        logger
    })
    const compendiumRepository = createCompendiumRepository({
        tracker: trackers.repositories,
        debouncedTracker,
        getGame,
        fromUuid,
        logger
    })
    const rollTableService = createRollTableService({
        tracker: trackers.services,
        debouncedTracker,
        compendiumRepository,
        logger
    })

    const socketGateway = createSocketGateway({
        tracker: trackers.sockets,
        getGame,
        getExecutor,
        logger
    })

    const macroRegistry = createMacroRegistry({ logger })
    const directMacroInvoker = createDirectMacroInvoker({
        tracker: trackers.macros,
        macroRegistry,
        activeEffectRepository,
        itemRepository,
        logger
    })

    const actionExecutor = createActionExecutor({
        tracker: trackers.mutations,
        actorRepository,
        onceService,
        logger
    })

    const localMutationAdapter = createLocalTransformationMutationAdapter({
        tracker: trackers.mutations,
        actorRepository,
        getTransformationQueryService: getTransformationQueryService,
        itemRepository,
        creatureTypeService,
        compendiumRepository,
        stageGrantResolver,
        actionExecutor,
        logger
    })

    const notifier = createNotifier({
        notifications,
        logger
    })

    return Object.freeze({
        actorRepository,
        rollTableService,
        chatService,
        activeEffectRepository,
        tokenRepository,
        itemRepository,
        compendiumRepository,
        socketGateway,
        macroRegistry,
        localMutationAdapter,
        actionExecutor,
        directMacroInvoker,
        onceService,
        notifier
    })
}
