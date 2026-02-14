export function registerDnd5eHooks({
    transformationService,
    triggerRuntime,
    debouncedTracker,
    logger
})
{

    Hooks.on("dnd5e.damageActor", (actor) =>
    {
        debouncedTracker.pulse("dnd5e.damageActor")
        logger.debug("dnd5e.damageActor called", actor);
        (async () =>
        {
            triggerRuntime.run("damage", actor)
        })()
    })

    Hooks.on("dnd5e.restCompleted", (actor, result) =>
    {
        debouncedTracker.pulse("dnd5e.restCompleted")
        logger.debug("dnd5e.restCompleted called", actor, result);
        (async () =>
        {
            if (result.type === "short") {
                triggerRuntime.run("shortRest", actor)
            } else if (result.longRest) {
                triggerRuntime.run("longRest", actor)
            }
        })()
    })

    Hooks.on("dnd5e.rollInitiative", (actor) =>
    {
        debouncedTracker.pulse("dnd5e.rolInitiative")
        logger.debug("dnd5e.rollInitiative called", actor);
        (async () =>
        {
            triggerRuntime.run("initiative", actor)
        })()
    })

    Hooks.on("dnd5e.beginConcentrating", (actor, item) =>
    {
        debouncedTracker.pulse("dnd5e.beginConcentrating")
        logger.debug("dnd5e.beginConcentrating called", actor, item);
        (async () =>
        {
            if (item.type !== "spell") return
            if (!item.system.duration.concentration) return
            triggerRuntime.run("concentration", actor)
        })()
    })

    Hooks.on("dnd5e.preRollHitDieV2", (context) =>
    {
        debouncedTracker.pulse("dnd5e.preRollHitDieV2")
        logger.debug("dnd5e.preRollHitDieV2 called", context);
        (async () =>
        {
            return transformationService.onHitDieRoll(
                context
            )
        })()
    })

    Hooks.on("dnd5e.preRollSavingThrow", (context, options, data) =>
    {
        debouncedTracker.pulse("dnd5e.preRollSavingThrow")
        logger.debug("dnd5e.preRollSavingThrow called", context, options, data);
        (async () =>
        {
            if (context.workflow?.item?.type !== "spell") return
            return transformationService.onPreSavingThrow(
                context
            )
        })()
    })

    Hooks.on("dnd5e.rollSavingThrow", (rolls, context) =>
    {
        debouncedTracker.pulse("dnd5e.rollSavingThrow")
        logger.debug("dnd5e.rollSavingThrow called", rolls, context);
        (async () =>
        {
            const roll = rolls?.[0]
            if (!roll) return
            transformationService.onSavingThrow(
                actor,
                roll
            )
        })()
    })
}
