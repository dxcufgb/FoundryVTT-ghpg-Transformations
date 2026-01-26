import { createStageGrantResolver } from "../domain/transformation/stageGrantResolver.js";
import { createActiveEffectRepository } from "../infrastructure/foundry/activeEffectsRepository.js";
import { createActorRepository } from "../infrastructure/foundry/actorRepository.js";
import { createCompendiumRepository } from "../infrastructure/foundry/compendiumRepository.js";
import { createEffectService } from "../infrastructure/foundry/createEffectService.js";
import { createCreatureTypeService } from "../infrastructure/foundry/creatureSubTypeService.js";
import { createItemRepository } from "../infrastructure/foundry/itemRepository.js";
import { createTokenRepository } from "../infrastructure/foundry/tokenRepository.js";
import { createLocalTransformationMutationAdapter } from "../infrastructure/mutations/createLocalTransformationMutationAdapter.js";
import { createSocketGateway } from "../infrastructure/socket/createSocketGateway.js";
import { createMacroRegistry } from "../macros/macroRegistry.js";
import { createDirectMacroInvoker } from "../macros/createDirectMacroInvoker.js";
import { createRollTableService } from "../infrastructure/rolltables/createRollTableService.js";
import { createActionExecutor } from "../infrastructure/actions/createActionExecutor.js";
import { createChatService } from "../infrastructure/foundry/createChatService.js";

export function createInfrastructure({
    getGame,
    logger,
    dependencies
}) {
    const { utils, constants } = dependencies;

    const chatService = createChatService({ logger });

    const actorRepository = createActorRepository({ getGame, logger });
    const tokenRepository = createTokenRepository({ logger });
    const itemRepository = createItemRepository({ logger });
    const activeEffectRepository = createActiveEffectRepository({ logger });

    const effectService = createEffectService({
        actorRepository,
        itemRepository,
        logger
    });

    const stageGrantResolver = createStageGrantResolver({ logger });
    const creatureTypeService = createCreatureTypeService({
        actorRepository,
        itemRepository,
        utils,
        logger
    })
    const compendiumRepository = createCompendiumRepository({ getGame, fromUuid, logger });
    const rollTableService = createRollTableService({ compendiumRepository, logger });

    const socketGateway = createSocketGateway({ getGame, isGM: () => game.user?.isGM === true, logger });

    const macroRegistry = createMacroRegistry({ logger });
    const directMacroInvoker = createDirectMacroInvoker({
        macroRegistry,
        activeEffectRepository,
        itemRepository,
        logger
    });

    const actionExecutor = createActionExecutor({
        actorRepository,
        logger
    });

    const localMutationAdapter = createLocalTransformationMutationAdapter({
        actorRepository,
        itemRepository,
        creatureTypeService,
        stageGrantResolver,
        effectService,
        directMacroInvoker,
        compendiumRepository,
        rollTableService,
        actionExecutor,
        utils,
        logger
    });

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
        directMacroInvoker
    });
}
