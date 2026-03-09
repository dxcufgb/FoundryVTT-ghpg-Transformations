import
{
    setRegistryDependencies,
    setRegistryInfrastructure,
    setRegistryServices,
    setRegistryLogger
} from "../../bootstrap/registry.js"

import { createDependencies } from "../../bootstrap/createDependencies.js"
import { createInfrastructure } from "../../bootstrap/createInfrastructure.js"
import { createServices } from "../../bootstrap/createServices.js"
import { createUi } from "../../ui/createUi.js"

import { createLogger } from "../../infrastructure/logging/logger.js"
import { createUtils } from "../../utils/createUtils.js"
import * as constants from "../../config/constants.js"
import { UiAccessor } from "../../bootstrap/uiAccessor.js"

/**
 * Build a COMPLETE test runtime.
 * Everything returned here is isolated.
 */
export function createTestRuntime({
    serviceMocks = {},
    infrastructureMocks = {},
    loggerLevel = 0
} = {})
{
    // 🧪 mark test runtime
    globalThis.__TRANSFORMATIONS_TEST__ = true

    // 1️⃣ Logger
    const logger = createLogger({
        prefix: "Transformations[Test]",
        level: loggerLevel
    })

    // 2️⃣ Dependencies
    const dependencies = createDependencies({
        game,
        constants,
        utils: createUtils({ constants, logger }),
        logger
    })

    // 3️⃣ Infrastructure
    const infrastructure = createInfrastructure({
        getGame: () => game,
        logger,
        dependencies,
        getTransformationQueryService: () => services.transformationQueryService,
        getExecutor: () => services.transformationMutationGateway,
        notifications: () => ui.notifications,
        ...infrastructureMocks
    })

    // 4️⃣ Services (THIS is where mocking actually works)
    const services = createServices({
        getGame: () => game,
        dependencies,
        infrastructure,
        overrides: serviceMocks
    })

    // 5️⃣ Publish runtime to Registry
    setRegistryLogger(logger)
    setRegistryDependencies(dependencies)
    setRegistryInfrastructure(infrastructure)
    setRegistryServices(services)

    // 6️⃣ UI (dialogs, adapters, factories)
    const ui = createUi({
        services,
        infrastructure,
        renderTemplate: foundry.applications.handlebars.renderTemplate,
        tracker: dependencies.utils.asyncTrackers.get("ui"),
        debouncedTracker: dependencies.utils.asyncTrackers.debounced,
        logger
    })

    // 7️⃣ Replace global UI access
    UiAccessor.dialogs = ui.dialogs

    return {
        logger,
        dependencies,
        infrastructure,
        services,
        ui
    }
}
