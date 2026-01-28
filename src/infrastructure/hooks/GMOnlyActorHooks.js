export function registerGMOnlyActorHooks({
    game,
    ActorClass,
    ui,
    actorRepository,
    triggerRuntime,
    transformationQueryService,
    constants,
    registerActorSheetControlsAdapter,
    logger
}) {
    // ─────────────────────────────────────────────────────────────
    // GM-only Actor Sheet controls
    // ─────────────────────────────────────────────────────────────

    registerActorSheetControlsAdapter({
        game,
        ActorClass,
        transformationQueryService,
        ui,
        logger
    });

    // ─────────────────────────────────────────────────────────────
    // GM-only effect creation hook
    // ─────────────────────────────────────────────────────────────

    Hooks.on("createActiveEffect", async (effect, options, userId) => {
        const executionContext = effect.parent?.getFlag("transformations", "executionContext");

        if (executionContext === "macro") return;

        logger.debug("GM createActiveEffect", effect, options, userId);

        const actor = effect.parent;
        if (!actor) return;

        const transformation = await transformationQueryService.getForActor(actor);
        if (!transformation) return;

        const effectName = effect.name?.toLowerCase();

        switch (effectName) {
            case constants.CONDITION.BLOODIED:
                try {
                    await triggerRuntime.run("bloodied", actor);
                } catch (err) {
                    logger.error(
                        "Error handling bloodied trigger",
                        { actor, err }
                    );
                }
                break;

            default:
                break;
        }
    });

    // ─────────────────────────────────────────────────────────────
    // GM-only effect application hook
    // ─────────────────────────────────────────────────────────────

    Hooks.on("applyActiveEffect", async (target, context) => {
        const actor = actorRepository.resolveActor(target);
        const executionContext = actor?.getFlag("transformations", "executionContext");

        if (executionContext === "macro") return;

        logger.debug("GM applyActiveEffect", actor, context);

        if (!actor) return;

        const transformation = await transformationQueryService.getForActor(actor);
        if (!transformation) return;

        const effectName = context.effect?.name?.toLowerCase();

        switch (effectName) {
            case constants.CONDITION.UNCONSCIOUS:
                try {
                    await triggerRuntime.run("bloodied", actor);
                } catch (err) {
                    logger.error(
                        "Error handling unconscious trigger",
                        { actor, err }
                    );
                }
                break;

            default:
                logger.debug("Unhandled effect", effectName);
                break;
        }
    });
}
