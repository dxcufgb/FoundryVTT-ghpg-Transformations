Hooks.once("init", async () => {
    console.log("Transformations | Init");
    globalThis.Transformations ??= {}

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

    const constants = await import("./Constants.js");
    Transformations.constants = {}
    Object.assign(Transformations.constants, constants);
    console.log("Transformations | Constants loaded", Transformations.constants);
    const transformationMasterClass = await import("./Transformations/Transformation.js");
    Transformations.Transformations = {}
    Transformations.Transformations['master'] = transformationMasterClass;
    console.log("Transformations | Transformation Master class loaded", Transformations.Transformations);
    // const utils = await import("./TransformationSupportFunctions.js");

    // const dialogs = await import("./TransformationDialogs.js");

    // await import("./Transformations/RollTables/unstable-form-roll-table-macros.js");

    // await import("./Transformations/AberrantHorror.js");

    // Transformations.constants = constants
});

Hooks.once("setup", () => {
    console.log("Transformations | Setup");
});

Hooks.once("ready", () => {
    console.log("Transformations | Ready");
});

Hooks.on("dnd5e.damageActor", async (actor, amount, updates) => {
    let transformation = new Transformation(actor);
    if (transformation.initialized) {
        transformation.onDamage();
    }
});

Hooks.on("dnd5e.restCompleted", async (actor, result) => {
    let transformation = new Transformation(actor);
    if (transformation.initialized) {
        if (result.type == "short") {
            transformation.onShortRest();
        } else if (result.longRest) {
            transformation.onLongRest();
        }
    }
});

Hooks.on("dnd5e.rollInitiative", (actor, combatant) => {
    let transformation = new Transformation(actor);
    if (transformation.initialized) {
        transformation.onInitiative();
    }
});