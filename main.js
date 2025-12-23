Hooks.once("init", async () => {
    console.log("Transformations | Init");
    globalThis.Transformations = {
        transformations: new Map(),
        constants: new Map(),
        supportFunctions: new Map(),
        dialogs: new Map()
    };

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

    await import("./Constants.js");
    await import("./Transformations/Transformation.js");
    await import("./TransformationSupportFunctions.js");
    await import("./TransformationDialogs.js");
    await import("./Transformations/RollTables/unstable-form-roll-table-macros.js");
    await import("./Transformations/AberrantHorror.js");
});

Hooks.once("setup", () => {
    console.log("Transformations | Setup");
});

Hooks.once("ready", () => {
    console.log("Transformations | Ready");
});