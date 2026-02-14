import { createMacroRegistry } from "./macroRegistry.js"
import { createMacroExecutor } from "./createMacroExecutor.js"
import { createMacroContextFactory } from "../infrastructure/macros/createMacroContextFactory.js"

export function bootstrapMacros({
    infrastructure,
    notify,
    tracker,
    logger
})
{
    const { actorRepository, itemRepository, tokenRepository, socketGateway, activeEffectRepository, macroRegistry } = infrastructure

    const macroContextFactory = createMacroContextFactory({ logger })

    const macroExecutor = createMacroExecutor({
        actorRepository: actorRepository,
        tokenRepository: tokenRepository,
        socketGateway: socketGateway,
        activeEffectRepository,
        itemRepository,
        macroRegistry,
        macroContextFactory,
        tracker,
        logger,
        notify
    })

    return Object.freeze({
        executeMacro: macroExecutor.macroWrapper
    })
}
