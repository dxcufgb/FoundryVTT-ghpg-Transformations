Hooks.once("init", async () => {
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
    // CONFIG.debug.hooks = true;
    globalThis.TransformationModule ??= {};

    CONFIG.DND5E.featureTypes.transformation = {
        label: "Transformation Feature",
        subtypes: {
            aberrantHorror: "Aberrant Horror",
            fey: "Fey",
            fiend: "Fiend",
            hag: "Hag",
            lich: "Lich",
            lycanthrope: "Lycanthrope",
            ooze: "Ooze",
            primordial: "Primordial",
            seraph: "Seraph",
            shadowsteelGhoul: "Shadowsteel Ghoul",
            specter: "Specter",
            vampire: "Vampire"
        }
    }

    TransformationModule.constants = {};
    TransformationModule.dialogs = {};
    TransformationModule.utils = {};
    TransformationModule.Transformations = new Map();
    Object.assign(TransformationModule.constants, await import("./TransformationConstants.js"));
    TransformationModule.TransformationParent = await import("./Transformations/Transformation.js");
    Object.assign(TransformationModule.utils, await import("./TransformationUtils.js"));
    Object.assign(TransformationModule.dialogs, await import("./TransformationDialogs.js"));
    await import("./Transformations/manifest.js");
});

Hooks.once("setup", () => {
    console.log("Transformations | Setup");
});

Hooks.once("ready", () => {
    console.log("Transformations | Ready");
    if (!game.modules.get("lib-wrapper")?.active) {
        ui.notifications.error("libWrapper is not active!");
        return;
    }

    libWrapper.register(
        "transformations",
        "dnd5e.damageActor",
        async (wrapped, actor, amount, updates) => {
            let parentFunctionResult = wrapped(actor, amount, updates)
            console.log(actor);
            console.log(amount);
            console.log(updates);
            let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
            if (transformation.initialized) {
                transformation.onDamage();
            }
            return parentFunctionResult
        },
        "WRAPPER",
        {}
    );

    libWrapper.register(
         "transformations",
         "dnd5e.preRollHitDieV2",
         async function (wrapped, context) {
            console.log(context);
            console.log("hit die roll");
            let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(context.subject);
             context = transformation.onHitDieRoll(context);
             return wrapped(context)
        },
        "WRAPPER",
        {}
    );
}

// Hooks.on("dnd5e.damageActor", async (actor, amount, updates) => {
//     console.log(actor);
//     console.log(amount);
//     console.log(updates);
//     let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
//     if (transformation.initialized) {
//         transformation.onDamage();
//     }
// });

Hooks.on("dnd5e.restCompleted", async (actor, result) => {
    console.log(actor);
    console.log(result);
    let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
    if (transformation?.initialized) {
        if (result.type == "short") {
            transformation.onShortRest(result);
        } else if (result.longRest) {
            transformation.onLongRest(result);
        }
    }
});

Hooks.on("dnd5e.rollInitiative", (actor, combatant) => {
    console.log(actor);
    console.log(combatant);
    let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
    if (transformation.initialized) {
        transformation.onInitiative();
    }
});

Hooks.on("useItem", (item, config, options) => {
    console.log(item);
    console.log(config);
    console.log(options);
    const actor = TransformationModule.utils.getCurrentActor()
    let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
    if(transformation.initialized){
        if (item.type === "spell") {
            const isConcentration = item.system.components?.concentration;
            if (isConcentration) {
                console.log(`Concentration spell cast: ${item.name}`);
                transformation.onConcentration()
            }
        }
    }
});

Hooks.on("createActiveEffect", (effect, options, userId) => {
    console.log(effect);
    console.log(options);
    console.log(userId);
  const actor = effect.parent;
    let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
    if (transformation.initialized) {
        transformation.onCreateaActiveEffect(effect)
    }
});

// Hooks.on("dnd5e.preRollHitDieV2", (context) => {
//     console.log(context);
//     console.log("hit die roll");
//     let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(context.subject);
//     context = transformation.onHitDieRoll(context);
// });