export function registerGMOnlyActorHooks({
    game,
    ActorClass,
    ui,
    actorRepository,
    triggerRuntime,
    transformationQueryService,
    constants,
    registerActorSheetControlsAdapter,
    debouncedTracker,
    logger
})
{
    logger.debug("registerGMOnlyActorHooks", {
        game,
        ActorClass,
        ui,
        actorRepository,
        triggerRuntime,
        transformationQueryService,
        constants,
        registerActorSheetControlsAdapter,
        debouncedTracker
    })

    registerActorSheetControlsAdapter({
        game,
        ActorClass,
        debouncedTracker,
        transformationQueryService,
        ui,
        logger
    })

    Hooks.on("createActiveEffect", async (effect, options, userId) =>
    {
        logger.debug("GM createActiveEffect", effect, options, userId)
        debouncedTracker.pulse("createActiveEffect")
        const executionContext = effect.parent?.getFlag("transformations", "executionContext")

        if (executionContext === "macro") return

        const actor = effect.parent
        if (!actor) return

        const transformation = await transformationQueryService.getForActor(actor)
        if (!transformation) return

        const effectName = effect.name?.toLowerCase()

        switch (effectName) {
            case constants.CONDITION.BLOODIED:
                try {
                    await triggerRuntime.run("bloodied", actor)
                } catch (err) {
                    logger.error(
                        "Error handling bloodied trigger",
                        { actor, err }
                    )
                }
                break

            default:
                break
        }
    })

    Hooks.on("applyActiveEffect", async (target, context) =>
    {
        logger.debug("GM applyActiveEffect", target, context)
        debouncedTracker.pulse("applyActiveEffect")
        const actor = actorRepository.resolveActor(target)
        const executionContext = actor?.getFlag("transformations", "executionContext")

        if (executionContext === "macro") return

        if (!actor) return

        const transformation = await transformationQueryService.getForActor(actor)
        if (!transformation) return

        const effectName = context.effect?.name?.toLowerCase()

        switch (effectName) {
            case constants.CONDITION.UNCONSCIOUS:
                try {
                    await triggerRuntime.run("bloodied", actor)
                } catch (err) {
                    logger.error(
                        "Error handling unconscious trigger",
                        { actor, err }
                    )
                }
                break

            default:
                logger.debug("Unhandled effect", effectName)
                break
        }
    })
}
