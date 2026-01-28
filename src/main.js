const isTest = import.meta.env["MODE"];
// main.js — Composition Root for Transformations Module
import { Registry } from "./bootstrap/registry.js";
import { createDependencies } from "./bootstrap/createDependencies.js";
import { createInfrastructure } from "./bootstrap/createInfrastructure.js";
import { createServices } from "./bootstrap/createServices.js";
import { registerTransformationMacros } from "./bootstrap/registerTransformtaionsMacros.js";
// constants
import * as constants from "./config/constants.js";

// infrastructure
import { createLogger } from "./infrastructure/logging/logger.js";
import { createDnd5eConfig } from "./infrastructure/config/createDnd5eConfig.js";
import { preloadTemplates } from "./infrastructure/templates/preloadTemplates.js";
import { registerGMOnlyDnd5eHooks } from "./infrastructure/hooks/GMOnlyDnd5eHooks.js";
import { registerGMOnlyActorHooks } from "./infrastructure/hooks/GMOnlyActorHooks.js";
import { registerDnd5eHooks } from "./infrastructure/hooks/dnd5eHooks.js";
import { registerActorHooks } from "./infrastructure/hooks/actorHooks.js";
import { createGMTransformationHandlers } from "@src/infrastructure/socket/gmTransformationHandlers.js";
import { registerSockets } from "./infrastructure/socket/registerSockets.js";

// domain
// import { registerTransformations } from "./domain/transformation/manifest.js";

//utils
import { createUtils } from "./utils/createUtils.js";

// macros
import { bootstrapMacros } from "./macros/createMacros.js";

//ui
import { createUi } from "./ui/createUi.js";
import { registerActorSheetControlsAdapter } from "./ui/adapters/actorSheetControlsAdapter.js";

//dev-things
import { applyTransformationFlags } from "./flags/applyTransformationFlags.js";
import { transformationFlagEntries } from "./flags/index.js";

//hasRun set to false for dev function.
let hasRun = false;

// ─────────────────────────────────────────────────────────────
// INIT — no construction, no wiring
// ─────────────────────────────────────────────────────────────

// 1️⃣ Logger (first, always)
const logger = createLogger({
    prefix: "Transformations",
    level: 1
});

// 2️⃣ Dependencies (platform + pure utilities)
const dependencies = createDependencies({
    game,
    constants,
    utils: createUtils({
        constants,
        logger
    }),
    logger
});

// 3️⃣ Infrastructure (Foundry-bound, fully initialized)
const infrastructure = createInfrastructure({
    getGame: () => game,
    logger,
    dependencies,
    getTransformationQueryService: () => Registry.services.transformationQueryService
});

// 4️⃣ Populate Registry ONCE
Registry.logger = logger;
Registry.dependencies = dependencies;
Registry.infrastructure = infrastructure;


Hooks.once("init", () => {
    if (!isTest) {
        console.log("Transformations | Init");
    }

    // Kill legacy facade access explicitly
    Object.defineProperty(globalThis, "TransformationModule", {
        get() {
            throw new Error(
                "TransformationModule facade removed. Use Registry instead."
            );
        }
    });
});


// ─────────────────────────────────────────────────────────────
// SETUP — THE ONLY PLACE OBJECTS ARE CREATED
// ─────────────────────────────────────────────────────────────

Hooks.once("setup", async () => {
    if (!isTest) {
        console.log("Transformations | Setup");
    }

    const { dependencies, infrastructure, logger } = Registry;

    await game.ready;

    if (game.user.isGM) Registry.logger.setLogLevel(5);

    // 1️⃣ Services (application layer)
    const services = createServices({
        dependencies,
        infrastructure
    });

    // ─────────────────────────────────────────────────────────────
    // UI assembly (factories + helpers, no hooks)
    // ─────────────────────────────────────────────────────────────

    const ui = createUi({
        services,
        infrastructure,
        renderTemplate: foundry.applications.handlebars.renderTemplate,
        logger
    });

    // 2️⃣ Populate Registry ONCE
    Registry.services = services;

    // 3️⃣ Freeze everything (DI enforcement)
    Object.freeze(Registry.dependencies);
    Object.freeze(Registry.infrastructure);
    Object.freeze(Registry.services);
    Object.freeze(Registry);

    // 4️⃣ Domain registration
    // registerTransformations(services.transformationRegistry);
    // services.triggerRuntime.build();

    // Macro registrations
    registerTransformationMacros({
        macroRegistry: Registry.infrastructure.macroRegistry,
        activeEffectRepository: Registry.infrastructure.activeEffectRepository,
        itemRepository: Registry.infrastructure.itemRepository,
        logger: Registry.logger
    });

    // 5️⃣ UI templates
    await preloadTemplates();

    // 6️⃣ Hook registration (pure wiring)
    registerDnd5eHooks({
        transformationService: services.transformationService,
        triggerRuntime: services.triggerRuntime,
        logger
    });

    registerActorHooks({
        transformationService: services.transformationService,
        transformationQueryService: services.transformationQueryService,
        ui,
        constants,
        logger
    });

    if (game.user.isGM) {
        registerGMOnlyDnd5eHooks({
            transformationService: services.transformationService,
            transformationQueryService: services.transformationQueryService,
            constants,
            logger
        });

        registerGMOnlyActorHooks({
            game,
            ActorClass: Actor,
            ui,
            triggerRuntime: services.triggerRuntime,
            transformationQueryService: services.transformationQueryService,
            actorRepository: infrastructure.actorRepository,
            registerActorSheetControlsAdapter,
            constants,
            logger
        });
    }

    globalThis.TransformationsDev = {
        applyFlags: async ({ dryRun = false } = {}) => {
            if (hasRun && !dryRun) {
                if (!isTest) {
                    console.warn("Flags already applied this session");
                }
                return;
            }
            hasRun = true;
            return applyTransformationFlags(
                transformationFlagEntries,
                { dryRun }
            );
        }
    };

    logger.log("applying transformation flags!");
    TransformationsDev.applyFlags();
    logger.log("flags applied!");

    const transformationSubTypes = Registry.services.transformationRegistry.getAllEntries().reduce((acc, entry) => {
        acc[entry.itemId] =
            entry.TransformationClass.displayName;
        return acc;
    }, {});
    createDnd5eConfig({
        transformationSubTypes,
        constants
    });
    if (!isTest) {
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
    `);
    }
    if (!isTest) {
        console.log("Transformations | Setup complete");
    }
});


// ─────────────────────────────────────────────────────────────
// READY — runtime behavior only
// ─────────────────────────────────────────────────────────────

Hooks.once("ready", async () => {
    if (!isTest) {
        console.log("Transformations | Ready");
    }

    // 🔟 Macros
    const macros = bootstrapMacros({
        infrastructure: Registry.infrastructure,
        notify: ui.notifications,
        logger: Registry.logger
    });

    game.socket.on("module.transformations", async data => {
        if (!game.user.isGM) return;
        if (data.type !== "EXECUTE_MACRO") return;

        if (!validateMacroPayload(data.payload, { logger })) {
            logger.warn("Rejected invalid macro payload from socket", data);
            return;
        }

        await macros.executeMacro(data.payload);
    });
    game.transformations = macros;

    if (!game.user.isGM) return;

    const playerActors = game.actors.filter(
        a => a.type === "character" && a.hasPlayerOwner
    );

    await Promise.all(
        playerActors.map(actor =>
            Registry.infrastructure.actorRepository.clearAllMacroExecutionsForActor(actor)
        )
    );

});

Hooks.once("socketlib.ready", () => {
    const socket = socketlib.registerModule(constants.MODULE_NAME);

    Registry.infrastructure.socketGateway.setSocket(socket);

    registerSockets({
        socketGateway: Registry.infrastructure.socketGateway,
        transformationMutationGateway: () => Registry.services.transformationMutationGateway,
        createGMTransformationHandlers,
        logger: Registry.logger
    });

    Registry.logger.debug("socketlib registered");
});