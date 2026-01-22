export function registerDnd5eHooks({
    transformationService,
    logger
}) {

    Hooks.on("dnd5e.damageActor", (actor) => {
        logger.debug("dnd5e.damageActor called", actor);
        (async () => {
            transformationService.onDamage(actor);
        })();
    });

    Hooks.on("dnd5e.restCompleted", (actor, result) => {
        logger.debug("dnd5e.restCompleted called", actor, result);
        (async () => {
            if (result.type === "short") {
                transformationService.onShortRest(actor);
            } else if (result.longRest) {
                transformationService.onLongRest(actor);
            }
        })();
    });

    Hooks.on("dnd5e.rollInitiative", (actor) => {
        logger.debug("dnd5e.rollInitiative called", actor);
        (async () => {
            transformationService.onInitiative(actor);
        })();
    });

    Hooks.on("dnd5e.beginConcentrating", (actor, item) => {
        logger.debug("dnd5e.beginConcentrating called", actor, item);
        (async () => {
            if (item.type !== "spell") return;
            if (!item.system.duration.concentration) return;
            transformationService.onConcentration(actor);
        })();
    });

    Hooks.on("dnd5e.preRollHitDieV2", (context) => {
        logger.debug("dnd5e.preRollHitDieV2 called", context);
        (async () => {
            return transformationService.onHitDieRoll(
                context
            );
        })();
    });

    Hooks.on("dnd5e.preRollSavingThrow", (context, options, data) => {
        logger.debug("dnd5e.preRollSavingThrow called", context, options, data);
        (async () => {
            if (context.workflow?.item?.type !== "spell") return;
            return transformationService.onPreSavingThrow(
                context
            );
        })();
    });

    Hooks.on("dnd5e.rollSavingThrow", (rolls, context) => {
        logger.debug("dnd5e.rollSavingThrow called", rolls, context);
        (async () => {
            const roll = rolls?.[0];
            if (!roll) return;
            transformationService.onSavingThrow(
                actor,
                roll
            );
        })();
    });
}