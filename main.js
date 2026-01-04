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
    globalThis.TransformationModule ??= {};
    TransformationModule.logger = logger.getLogger(5)
    TransformationModule.constants = {};
    TransformationModule.dialogConfigs = {};
    TransformationModule.dialogs = {};
    TransformationModule.utils = {};
    TransformationModule.compendiums = {};
    TransformationModule.Transformations = new Map();
    TransformationModule.EventListeners = {};
    TransformationModule.pending = new Map();
    TransformationModule.cachedTemplates = new Map();
    Object.assign(TransformationModule.constants, await import("./TransformationConstants.js"));
    TransformationModule.dialogConfigs["showConfiguration"] = {}
    TransformationModule.dialogConfigs["choiceDialogConfig"] = {}
    TransformationModule.dialogConfigs.showConfiguration = await import("./templates/configs/TransformationConfig.js")
    TransformationModule.dialogConfigs.choiceDialogConfig = await import("./templates/configs/ChoiceDialogConfig.js")
    TransformationModule.TransformationParent = await import("./transformations/Transformation.js");
    Object.assign(TransformationModule.utils, await import("./TransformationUtils.js"));
    Object.assign(TransformationModule.dialogs, await import("./TransformationDialogs.js"));
    TransformationModule.EventListeners = await import("./TransformationEventListeners.js");
    
    await foundry.applications.handlebars.loadTemplates([
        "modules/transformations/scripts/templates/pill.hbs"
    ]);
    TransformationModule.cachedTemplates["actorTransformationPill"] = Handlebars.partials["modules/transformations/scripts/templates/pill.hbs"];
});

Hooks.once("setup", async () => {
    console.log("Transformations | Setup");
    const rollTables = await TransformationModule.utils.importCompendiumPack("transformations.gh-roll-tables");
    const transformations = await TransformationModule.utils.importCompendiumPack("transformations.gh-transformations");
    let cachedCompendiums = { rollTables: rollTables, transformations: transformations };
    Object.assign(TransformationModule.compendiums, cachedCompendiums)
    await import("./transformations/manifest.js");

    Hooks.call("transformations.preTransformationsConfigSetup", TransformationModule.Transformations);

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

    CONFIG.DND5E.characterFlags.transformations = {
        type: "string",
        choices: choices,
        name: "Transformation",
        hint: "Transformation active on the character",
        section: "Transformations"
    };

    CONFIG.DND5E.characterFlags.transformationStage = {
        type: Number,
        choices: {
            "1": "1",
            "2": "2",
            "3": "3",
            "4": "4"
        },
        name: "Transformation Stage",
        hint: "Stage of active transformation on the character",
        section: "Transformations"
    };
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
    if (context.workflow.item?.type == TransformationModule.constants.ITEM_TYPE.SPELL) {
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
    const transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(app.actor);
    TransformationModule.EventListeners.registerTransformationConfigurationEventListeners(app, originalHtml, config);
    const html = TransformationModule.cachedTemplates.actorTransformationPill(transformation.getPillsData(config.editable))
    const fragment = document.createRange().createContextualFragment(html);
    let container = app.element.querySelector('[data-tab="details"] .pills-lg > .background').parentElement;
    if (!container) return;
    container.append(fragment)
});

Hooks.on("updateActor", async (actor, diff, options, userId) => {
    const flags = diff?.flags?.dnd5e;
    if (!flags) return;

    const transformationWasUpdated =
        "transformations" in flags ||
        "-=transformations" in flags ||
        "transformationStage" in flags;

    if (!transformationWasUpdated) return;

    clearTimeout(TransformationModule.pending.get(actor.id));
    TransformationModule.pending.set(
        actor.id,
        setTimeout(async () => {
            TransformationModule.pending.delete(actor.id);
            const transformation = TransformationModule.TransformationParent.Transformation.prototype.getTransformationType(actor);
            TransformationModule.logger.debugWarn("Should just fire once in a short timeperiod!");
            if (!transformation) return;
            await transformation.onTransformationUpdate();
            for (const appWindow of Object.values(ui.windows)) {
                if (
                    appWindow?.document?.id === actor.id &&
                    appWindow.constructor?.name?.startsWith("ActorSheet")
                ) {
                    try {
                        appWindow.render(true);
                    } catch (err) {
                        TransformationModule.logger.error(
                            "Failed to re-render actor sheet:",
                            err
                        );
                    }
                }
            }

            Hooks.call(
                "transformations.actorUpdated",
                actor,
                {
                    transformationWasUpdated: true
                }
            );

        }, 100)
    );
});