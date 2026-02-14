const isTest = import.meta?.env?.MODE === "test"
//test related things
import { cleanupQuenchTestActors } from "./quench/helpers/cleanupActors.js"
// main.js â€” Composition Root for Transformations Module
import { finalizeRegistry, Registry, setRegistryDependencies, setRegistryInfrastructure, setRegistryLogger, setRegistryServices } from "./bootstrap/registry.js"
import { createDependencies } from "./bootstrap/createDependencies.js"
import { createInfrastructure } from "./bootstrap/createInfrastructure.js"
import { createServices } from "./bootstrap/createServices.js"
import { registerTransformationMacros } from "./bootstrap/registerTransformtaionsMacros.js"
// constants
import * as constants from "./config/constants.js"

// infrastructure
import { createLogger } from "./infrastructure/logging/logger.js"
import { createDnd5eConfig } from "./infrastructure/config/createDnd5eConfig.js"
import { preloadTemplates } from "./infrastructure/templates/preloadTemplates.js"
import { registerGMOnlyDnd5eHooks } from "./infrastructure/hooks/GMOnlyDnd5eHooks.js"
import { registerGMOnlyActorHooks } from "./infrastructure/hooks/GMOnlyActorHooks.js"
import { registerDnd5eHooks } from "./infrastructure/hooks/dnd5eHooks.js"
import { registerActorHooks } from "./infrastructure/hooks/actorHooks.js"
import { createGMTransformationHandlers } from "./infrastructure/socket/gmTransformationHandlers.js"
import { registerSockets } from "./infrastructure/socket/registerSockets.js"

// domain
// import { registerTransformations } from "./domain/transformation/manifest.js";

//utils
import { createUtils } from "./utils/createUtils.js"

// macros
import { bootstrapMacros } from "./macros/createMacros.js"

//ui
import { createUi } from "./ui/createUi.js"
import { registerActorSheetControlsAdapter } from "./ui/adapters/actorSheetControlsAdapter.js"
import { UiAccessor } from "./bootstrap/uiAccessor.js"

//dev-things
import { applyTransformationFlags } from "./flags/applyTransformationFlags.js"
import { transformationFlagEntries } from "./flags/index.js"

//hasRun set to false for dev function.
let hasRun = false

const logger = createLogger({
    prefix: "Transformations",
    level: 1
})

const dependencies = createDependencies({
    game,
    constants,
    utils: createUtils({
        constants,
        logger
    }),
    logger
})

const infrastructure = createInfrastructure({
    getGame: () => game,
    logger,
    dependencies,
    getTransformationQueryService: () => Registry.services.transformationQueryService,
    getExecutor: () => Registry.services.transformationMutationGateway,
    notifications: () => ({
        notify: (...args) =>
        {
            if (globalThis.__TRANSFORMATIONS_TEST__) return
            ui.notifications.notify(...args)
        },
        info: (...args) =>
        {
            if (globalThis.__TRANSFORMATIONS_TEST__) return
            ui.notifications.info(...args)
        },
        warn: (...args) =>
        {
            if (globalThis.__TRANSFORMATIONS_TEST__) return
            ui.notifications.warn(...args)
        },
        error: (...args) =>
        {
            if (globalThis.__TRANSFORMATIONS_TEST__) return
            ui.notifications.error(...args)
        }
    })
})

setRegistryLogger(logger, { allowOnce: true })
setRegistryDependencies(dependencies, { allowOnce: true })
setRegistryInfrastructure(infrastructure, { allowOnce: true })


Hooks.once("init", () =>
{
    if (!isTest) {
        console.log("Transformations | Init")
    }

    // Kill legacy facade access explicitly
    Object.defineProperty(globalThis, "TransformationModule", {
        get()
        {
            throw new Error(
                "TransformationModule facade removed. Use Registry instead."
            )
        }
    })
})

Hooks.once("setup", async () =>
{
    if (!isTest) {
        console.log("Transformations | Setup")
    }

    const { dependencies, infrastructure, logger } = Registry

    await game.ready

    if (game.user.isGM) Registry.logger.setLogLevel(5)

    const services = createServices({
        dependencies,
        infrastructure
    })

    const ui = createUi({
        services,
        infrastructure,
        renderTemplate: foundry.applications.handlebars.renderTemplate,
        tracker: Registry.dependencies.utils.asyncTrackers.get("ui"),
        debouncedTracker: Registry.dependencies.utils.asyncTrackers.debounced,
        logger: Registry.logger
    })

    UiAccessor.dialogs = ui.dialogs

    setRegistryServices(services, { allowOnce: true })

    finalizeRegistry()

    // Macro registrations
    registerTransformationMacros({
        macroRegistry: Registry.infrastructure.macroRegistry,
        activeEffectRepository: Registry.infrastructure.activeEffectRepository,
        itemRepository: Registry.infrastructure.itemRepository,
        logger: Registry.logger
    })

    await preloadTemplates()

    registerDnd5eHooks({
        transformationService: services.transformationService,
        triggerRuntime: services.triggerRuntime,
        debouncedTracker: Registry.dependencies.utils.asyncTrackers.debounced,
        logger
    })

    const transformationSubTypes = services.transformationRegistry.getAllEntries().reduce((acc, entry) =>
    {
        acc[entry.itemId] =
            entry.TransformationClass.displayName
        return acc
    }, {})

    registerActorHooks({
        transformationTypes: transformationSubTypes,
        transformationService: services.transformationService,
        transformationQueryService: services.transformationQueryService,
        game,
        ui,
        debouncedTracker: Registry.dependencies.utils.asyncTrackers.debounced,
        constants,
        logger
    })

    if (game.user.isGM) {
        registerGMOnlyDnd5eHooks({
            transformationService: services.transformationService,
            transformationQueryService: services.transformationQueryService,
            constants,
            logger
        })

        registerGMOnlyActorHooks({
            game,
            ActorClass: Actor,
            ui,
            triggerRuntime: services.triggerRuntime,
            transformationQueryService: services.transformationQueryService,
            actorRepository: infrastructure.actorRepository,
            registerActorSheetControlsAdapter,
            debouncedTracker: Registry.dependencies.utils.asyncTrackers.debounced,
            constants,
            logger
        })
    }

    globalThis.TransformationsDev = {
        applyFlags: async ({ dryRun = false } = {}) =>
        {
            if (hasRun && !dryRun) {
                if (!isTest) {
                    console.warn("Flags already applied this session")
                }
                return
            }
            hasRun = true
            return applyTransformationFlags(
                transformationFlagEntries,
                { dryRun }
            )
        }
    }


    logger.log("applying transformation flags!")
    TransformationsDev.applyFlags()
    logger.log("flags applied!")

    createDnd5eConfig({
        transformationSubTypes,
        constants
    })
    if (!isTest) {
        transformationSubTypes,
            constants
    }

    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                                                   ║
║  ████████╗██████╗  █████╗ ███╗   ██╗███████╗███████╗ ██████╗ ██████╗ ███╗   ███╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗███████╗   ║
║  ╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██╔════╝██╔═══██╗██╔══██╗████╗ ████║██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝   ║
║     ██║   ██████╔╝███████║██╔██╗ ██║███████╗█████╗  ██║   ██║██████╔╝██╔████╔██║███████║   ██║   ██║██║   ██║██╔██╗ ██║███████╗   ║
║     ██║   ██╔══██╗██╔══██║██║╚██╗██║╚════██║██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║   ██║   ██║██║   ██║██║╚██╗██║╚════██║   ║
║     ██║   ██║  ██║██║  ██║██║ ╚████║███████║██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║███████║   ║
║     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝   ║
║                                                                                                                                   ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
`)


    const mod = game.modules.get("transformations")

    mod.api = {
        getTransformations()
        {
            return Registry.services
                .transformationRegistry
                .getAllEntries()
        },

        getTransformationById(id)
        {
            return Registry.services
                .transformationRegistry
                .getEntryByItemId(id)
        }
    }

    if (!isTest) {
        console.log("Transformations | Setup complete")
    }
})


Hooks.once("ready", async () =>
{
    if (!isTest) {
        console.log("Transformations | Ready")
    }

    const macros = bootstrapMacros({
        infrastructure: Registry.infrastructure,
        notify: ui.notifications,
        tracker: Registry.dependencies.utils.asyncTrackers.get("macros"),
        logger: Registry.logger
    })

    game.socket.on("module.transformations", async data =>
    {
        if (!game.user.isGM) return
        if (data.type !== "EXECUTE_MACRO") return

        if (!validateMacroPayload(data.payload, { logger })) {
            logger.warn("Rejected invalid macro payload from socket", data)
            return
        }

        await macros.executeMacro(data.payload)
    })
    game.transformations = macros

    if (!game.user.isGM) return

    const playerActors = game.actors.filter(
        a => a.type === "character" && a.hasPlayerOwner
    )

    await Promise.all(
        playerActors.map(actor =>
            Registry.infrastructure.actorRepository.clearAllMacroExecutionsForActor(actor)
        )
    )

})

Hooks.once("socketlib.ready", () =>
{
    const socket = socketlib.registerModule(constants.MODULE_NAME)

    Registry.infrastructure.socketGateway.setSocket(socket)

    registerSockets({
        socketGateway: Registry.infrastructure.socketGateway,
        transformationMutationGateway: () => Registry.services.transformationMutationGateway,
        createGMTransformationHandlers,
        logger: Registry.logger
    })

    Registry.logger.debug("socketlib registered")
})

Hooks.once("quenchReady", () =>
{
    console.log("Transformations | Quench Ready")

    globalThis.cleanupTestActors = cleanupQuenchTestActors

    import("./quench/quench.js")
})
