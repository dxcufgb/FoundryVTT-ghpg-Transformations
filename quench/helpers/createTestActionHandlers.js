import { createActionHandlers } from "../../services/actions/handlers/index.js"

export function createTestActionHandlers(runtime)
{
    const trackers = {
        repositories: runtime.dependencies.utils.asyncTrackers.get("repositories"),
        mutations: runtime.dependencies.utils.asyncTrackers.get("mutations"),
        sockets: runtime.dependencies.utils.asyncTrackers.get("sockets"),
        macros: runtime.dependencies.utils.asyncTrackers.get("macros"),
        ui: runtime.dependencies.utils.asyncTrackers.get("ui"),
        services: runtime.dependencies.utils.asyncTrackers.get("services")
    }
    return createActionHandlers({
        trackers,
        directMacroInvoker: runtime.infrastructure.directMacroInvoker,
        actorRepository: runtime.infrastructure.actorRepository,
        itemRepository: runtime.infrastructure.itemRepository,
        activeEffectRepository: runtime.infrastructure.activeEffectRepository,
        rollTableService: runtime.services.rollTableService,
        rollTableEffectResolver: runtime.services.rollTableEffectResolver,
        logger: runtime.dependencies.logger
    })
}
