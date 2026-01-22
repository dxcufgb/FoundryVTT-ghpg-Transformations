import { createMacroRegistry } from "./macroRegistry.js";
import { createMacroExecutor } from "./createMacroExecutor.js";
import { createMacroContextFactory } from "../infrastructure/macros/createMacroContextFactory.js";

export function bootstrapMacros({
    services,
    infrastructure,
    logger
}) {
    const { actorRepository, itemRepository, tokenRepository, socketGateway, activeEffectRepository, macroRegistry } = infrastructure
    // ─────────────────────────────────────────────────────────────
    // Registry
    // context factory
    // ─────────────────────────────────────────────────────────────

    const macroContextFactory = createMacroContextFactory({ logger });

    // ─────────────────────────────────────────────────────────────
    // Executor
    // ─────────────────────────────────────────────────────────────

    const macroExecutor = createMacroExecutor({
        actorRepository: actorRepository,
        tokenRepository: tokenRepository,
        socketGateway: socketGateway,
        activeEffectRepository,
        activeEffectRepository,
        itemRepository,
        macroRegistry,
        macroContextFactory,
        logger,
        notify: ui.notifications
    });

    // ─────────────────────────────────────────────────────────────
    // Public surface
    // ─────────────────────────────────────────────────────────────

    return Object.freeze({
        executeMacro: macroExecutor.macroWrapper
    });
}
