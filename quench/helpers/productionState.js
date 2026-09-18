import {
    Registry,
    setRegistryDependencies,
    setRegistryInfrastructure,
    setRegistryLogger,
    setRegistryMacros,
    setRegistryServices
} from "../../bootstrap/registry.js"
import { UiAccessor } from "../../bootstrap/uiAccessor.js"

// Test runtimes replace the global Registry and UiAccessor.dialogs. Capture the
// production state before any test runs so it can be restored afterwards.
const productionState = {
    dependencies: Registry.dependencies,
    infrastructure: Registry.infrastructure,
    services: Registry.services,
    macros: Registry.macros,
    logger: Registry.logger,
    dialogs: UiAccessor.dialogs
}

export function restoreProductionState()
{
    // Registry setters are only allowed while test mode is active.
    globalThis.__TRANSFORMATIONS_TEST__ = true

    setRegistryDependencies(productionState.dependencies)
    setRegistryInfrastructure(productionState.infrastructure)
    setRegistryServices(productionState.services)
    setRegistryMacros(productionState.macros)
    setRegistryLogger(productionState.logger)
    UiAccessor.dialogs = productionState.dialogs

    delete globalThis.__TRANSFORMATIONS_TEST__
    delete globalThis.___TransformationTestEnvironment___
}

Hooks.on("quenchReports", () => restoreProductionState())
