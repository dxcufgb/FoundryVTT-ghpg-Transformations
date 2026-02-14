import { Registry, setRegistryServices, setRegistryLogger }
    from "../../bootstrap/registry.js"

import { createDependencies }
    from "../../bootstrap/createDependencies.js"
import { createInfrastructure }
    from "../../bootstrap/createInfrastructure.js"
import { createServices }
    from "../../bootstrap/createServices.js"

import * as constants from "../../config/constants.js"
import { createLogger }
    from "../../infrastructure/logging/logger.js"
import { createUtils }
    from "../../utils/createUtils.js"
import { createUi }
    from "../../ui/createUi.js"
import { UiAccessor }
    from "../../bootstrap/uiAccessor.js"

export async function readyGame()
{
    if (!game.ready) {
        await new Promise(resolve => Hooks.once("ready", resolve))
    }
}

export function setupMocks(mocks = {})
{
    // 1️⃣ Logger (always fresh per test)
    const logger = createLogger({
        prefix: "Transformations[Test]",
        level: 0
    })

    // 2️⃣ Dependencies (pure, reusable)
    const dependencies = createDependencies({
        game,
        constants,
        utils: createUtils({ constants, logger }),
        logger
    })

    // 3️⃣ Infrastructure (Foundry-bound)
    const infrastructure = createInfrastructure({
        getGame: () => game,
        logger,
        dependencies,
        getTransformationQueryService: () =>
            Registry.services?.transformationQueryService,
        getExecutor: () =>
            Registry.services?.transformationMutationGateway
    })

    // 4️⃣ Services (override only what is provided)
    const services = createServices({
        dependencies,
        infrastructure,
        overrides: {
            ...(mocks.transformationService && {
                transformationService: mocks.transformationService
            }),
            ...(mocks.transformationMutationGateway && {
                transformationMutationGateway:
                    mocks.transformationMutationGateway
            })
        }
    })

    // 5️⃣ Publish this container as the active runtime
    setRegistryServices(services)
    setRegistryLogger(logger)

    // 6️⃣ UI (dialogs, adapters, factories)
    const ui = createUi({
        services,
        infrastructure,
        renderTemplate:
            foundry.applications.handlebars.renderTemplate,
        logger
    })

    UiAccessor.dialogs = ui.dialogs

    // 7️⃣ Return for direct test access if needed
    return {
        logger,
        dependencies,
        infrastructure,
        services,
        ui
    }
}
