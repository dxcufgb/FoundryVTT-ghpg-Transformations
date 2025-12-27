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
});

Hooks.on("dnd5e.damageActor", async (actor, amount, updates) => {
    let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
    if (transformation.initialized) {
        transformation.onDamage();
    }
});

Hooks.on("dnd5e.restCompleted", async (actor, result) => {
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
    let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
    if (transformation.initialized) {
        transformation.onInitiative();
    }
});

Hooks.on("dnd5e.beginConcentrating", (actor, item, activeEffect, midiUtilityActivity) => {
    console.log(actor);
    console.log(item);
    console.log(activeEffect);
    console.log(midiUtilityActivity);
    let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
    if (transformation.initialized) {
        if (item.type === "spell") {
            console.log(item.system)
            console.log(item.system.duration)
            console.log(item.system.duration.concentration)
            const isConcentration = item.system.duration.concentration;
            if (isConcentration) {
                console.log(`Concentration spell cast: ${item.name}`);
                transformation.onConcentration()
            }
        }
    }
});

Hooks.on("createActiveEffect", (effect, options, userId) => {
    if (effect.name == "Bloodied"){
        const actor = effect.parent;
        let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
        if (transformation.initialized) {
            transformation.onBloodied()
        }
    } else if (effect.name == "Unconscious") {
        const actor = effect.parent;
        let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
        if (transformation.initialized) {
            transformation.onUnconscious()
        }
    }
});

Hooks.on("dnd5e.preRollHitDieV2", (context) => {
    let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(context.subject);
    if (transformation.initialized) {
        context = transformation.onHitDieRoll(context);
    }
});

Hooks.on("dnd5e.pretRollSavingThrow", (context, arg2, arg3, arg4) => {
    console.log(context)
    console.log(arg2)
    console.log(arg3)
    console.log(arg4)
    if (context.workflow.item.type == "spell") {
        let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(context.subject);
        if (transformation.initialized) {
            // context = transformation.getTriggerFlag(context);
        }   
    }
    // if (!event.item && event.options?.origin) {
    //     fromUuid(context.options.origin).then(doc => {
    //         event.item = doc;
    //     });
    // }
    // console.log(event.item)
});

