import { createStageGrantResolver } from "../domain/transformation/stageGrantResolver.js";
import { createActiveEffectRepository } from "../infrastructure/foundry/activeEffectsRepository.js";
import { createActorRepository } from "../infrastructure/foundry/actorRepository.js";
import { createCompendiumRepository } from "../infrastructure/foundry/compendiumRepository.js";
import { createEffectService } from "../infrastructure/foundry/createEffectService.js";
import { createCreatureTypeService } from "../infrastructure/foundry/creatureSubTypeService.js";
import { createItemRepository } from "../infrastructure/foundry/itemRepository.js";
import { createTokenRepository } from "../infrastructure/foundry/tokenRepository.js";
import { createTransformationMutationGateway } from "../infrastructure/foundry/TransformationMutationGateway.js";
import { createLocalTransformationMutationAdapter } from "../infrastructure/mutations/createLocalTransformationMutationAdapter.js";
import { createSocketGateway } from "../infrastructure/socket/createSocketGateway.js";
import { createMacroRegistry } from "../macros/macroRegistry.js";
import { applyActions } from "../infrastructure/actions/applyActions.js";

export function createInfrastructure({
    getGame,
    logger,
    dependencies
}) {
    const { utils, constants } = dependencies;

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

    const socketGateway = createSocketGateway({ getGame, isGM: () => game.user?.isGM === true, logger });

    const localMutationAdapter = createLocalTransformationMutationAdapter({
        actorRepository,
        itemRepository,
        creatureTypeService,
        stageGrantResolver,
        effectService,
        compendiumRepository,
        applyActions,
        utils,
        logger
    });

    const transformationMutationGateway = createTransformationMutationGateway({
        socketGateway,
        localMutationAdapter,
        logger
    });

    const macroRegistry = createMacroRegistry({ logger });

    return Object.freeze({
        actorRepository,
        activeEffectRepository,
        tokenRepository,
        itemRepository,
        compendiumRepository,
        socketGateway,
        transformationMutationGateway,
        macroRegistry
    });
}
