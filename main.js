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
    let logger = await import("./logger.js");
    console.log(logger);
    globalThis.TransformationModule ??= {};
    TransformationModule.logger = logger.getLogger(5)
    TransformationModule.constants = {};
    TransformationModule.dialogConfigs = {};
    TransformationModule.dialogs = {};
    TransformationModule.utils = {};
    TransformationModule.compendiums = {};
    TransformationModule.Transformations = new Map();
    Object.assign(TransformationModule.constants, await import("./TransformationConstants.js"));
    TransformationModule.dialogConfigs["showConfiguration"] = {}
    TransformationModule.dialogConfigs.showConfiguration = await import("./Templates/Configs/TransformationConfig.js")
    TransformationModule.TransformationParent = await import("./Transformations/Transformation.js");
    Object.assign(TransformationModule.utils, await import("./TransformationUtils.js"));
    Object.assign(TransformationModule.dialogs, await import("./TransformationDialogs.js"));
    await import("./Transformations/manifest.js");

    let transformationSubTypes = {};

    for (const transformationSubClass of TransformationModule.Transformations.values()) {
        transformationSubTypes[transformationSubClass.id] = transformationSubClass.name;
    }

    CONFIG.DND5E.featureTypes.transformation = {
        label: TransformationModule.constants.TRANSFORMATION_FEATURE,
        subtypes: transformationSubTypes
    }
    let choices = {};
    TransformationModule.Transformations.forEach(transformation => {
        choices[transformation.itemId] = transformation.name;
    });
    globalThis.dnd5e.config.characterFlags["transformation"] = {
        type: "string",
        choices: choices,
        name: "Transformation",
        hint: "Transformation active on the character",
        section: "Transformations"
    };

    globalThis.dnd5e.config.characterFlags["transformation-level"] = {
        type: Number,
        choices: {
            1: 1,
            2: 2,
            3: 3,
            4: 4
        },
        name: "Transformation Level",
        hint: "Level of active transformation on the character",
        section: "Transformations"
    };

});

Hooks.once("setup", async () => {
    console.log("Transformations | Setup");
    const rollTables = await TransformationModule.utils.importCompendiumPack("transformations.gh-roll-tables");
    const transformations = await TransformationModule.utils.importCompendiumPack("transformations.gh-transformations");
    let cachedCompendiums = { rollTables: rollTables, transformations: transformations };
    Object.assign(TransformationModule.compendiums, cachedCompendiums)
});

Hooks.once("ready", () => {
    console.log("Transformations | Ready");
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
    let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
    if (transformation.initialized) {
        if (item.type === TransformationModule.constants.ITEM_TYPE.SPELL) {
            const isConcentration = item.system.duration.concentration;
            if (isConcentration) {
                transformation.onConcentration()
            }
        }
    }
});

Hooks.on("createActiveEffect", (effect, options, userId) => {
    if (effect.name.toLowerCase() == TransformationModule.constants.CONDITION.BLOODIED) {
        const actor = effect.parent;
        let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
        if (transformation.initialized) {
            transformation.onBloodied()
        }
    } else if (effect.name.toLowerCase() == TransformationModule.constants.CONDITION.UNCONSCIOUS) {
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

Hooks.on("dnd5e.preRollSavingThrow", (context, options, data) => {
    if (context.workflow.item.type == TransformationModule.constants.ITEM_TYPE.SPELL) {
        let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(context.subject);
        if (transformation.initialized) {
            context = transformation.getTriggerFlag(context, TransformationModule.constants.TRIGGER_FLAG.SPELL_SAVE);
        }
    }
});

Hooks.on("dnd5e.rollSavingThrow", (rolls, context) => {
    const roll = rolls[0]
    const transformationOptions = roll.options.transformations;
    if (transformationOptions) {
        let transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(context.subject);
        if (transformation.initialized) {
            const triggers = transformationOptions[transformation.itemId];
            triggers.forEach(trigger => {
                switch (triggers[trigger]) {
                    case TransformationModule.constants.TRIGGER_FLAG.SPELL_SAVE:
                        transformation.onSpellSavingThrow(roll);
                        break;
                    default:
                        console.warn(`Uknown transformationOptions ${trigger}`);
                }
            });
            transformation.onSavingThrow(roll);
        }
    }
});

Hooks.on("renderActorSheetV2", (app, originalHtml, config) => {
    if (app.document.flags.dnd5e.transformation) {
        TransformationModule.logger.log("actor: ", app.actor)
        const transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(app.actor);
        if (transformation.initialized) {
            originalHtml.addEventListener("click", event => {
                const button = event.target.closest("[data-action]");
                if (!button) return;

                const action = button.dataset.action;
                const config = button.dataset.config;
                if (action === "showConfiguration" && config === "transformation") {
                    if (!app.isEditable) return;
                    const showConfiguration = TransformationModule.dialogConfigs.showConfiguration;

                    new showConfiguration.TransformationConfig(
                        app.actor,
                        TransformationModule.transformations
                    ).render(true);
                }
            });
            (async () => {
                const html = await TransformationModule.utils.renderTransformationTemplate("pill", transformation.getPillsData(config.editable))
                TransformationModule.logger.debug("new pill: ", html);
                const fragment = document.createRange().createContextualFragment(html);
                originalHtml.querySelector(".pills-lg").append(fragment);
            })();
        }
    }
});