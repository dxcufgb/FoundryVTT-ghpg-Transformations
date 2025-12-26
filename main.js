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
    CONFIG.debug.hooks = true;
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
    TransformationModule.RegisteredTransformations = new Map();
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
        console.log("useItem");
        console.log(item);
        console.log(item.type);
        if (item.type === "spell") {
            console.log(item.flags)
            console.log(item.flags.dnd5e)
            console.log(item.flags.dnd5e?.concentration)
            const isConcentration = item.flags.dnd5e?.concentration;
            if (isConcentration) {
                console.log(`Concentration spell cast: ${item.name}`);
                transformation.onConcentration()
            }
        }
    }
});

// Hooks.on("createActiveEffect", (effect, options, userId) => {
//   const actor = effect.parent;
//     let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
//     if (transformation.initialized) {
//         transformation.onCreateaActiveEffect(effect)
//     }
// });

Hooks.on("dnd5e.preRollHitDieV2", (context) => {
    let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(context.subject);
    context = transformation.onHitDieRoll(context);
});