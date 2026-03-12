export function registerDnd5eHooks({
    transformationService,
    transformationRegistry,
    actorRepository,
    dialogFactory,
    triggerRuntime,
    onceService,
    tracker,
    debouncedTracker,
    logger
})
{
    logger.debug("registerDnd5eHooks", {
        transformationService,
        triggerRuntime,
        debouncedTracker
    })

    Hooks.on("dnd5e.damageActor", (actor) =>
    {
        logger.debug("dnd5e.damageActor called", actor)
        debouncedTracker.pulse("dnd5e.damageActor");
        (async () =>
        {
            triggerRuntime.run("damage", actor)
        })()
    })

    Hooks.on("dnd5e.restCompleted", (actor, result) =>
    {
        logger.debug("dnd5e.restCompleted called", actor, result)
        debouncedTracker.pulse("dnd5e.restCompleted")
        tracker.track((async () =>
        {
            const isLong = result.longRest === true
            const isShort = result.shortRest === true || result.type === "short"

            onceService.resetFlagsOnRest(actor, { isLong, isShort })
            if (isShort) {
                await triggerRuntime.run("shortRest", actor)
            } else if (isLong) {
                await triggerRuntime.run("longRest", actor)
            }
        })())
    })

    Hooks.on("dnd5e.rollInitiative", (actor) =>
    {
        logger.debug("dnd5e.rollInitiative called", actor)
        debouncedTracker.pulse("dnd5e.rolInitiative");
        (async () =>
        {
            triggerRuntime.run("initiative", actor)
        })()
    })

    Hooks.on("dnd5e.beginConcentrating", (actor, item) =>
    {
        logger.debug("dnd5e.beginConcentrating called", actor, item)
        debouncedTracker.pulse("dnd5e.beginConcentrating");
        (async () =>
        {
            if (item.type !== "spell") return
            if (!item.system.duration.concentration) return
            triggerRuntime.run("concentration", actor)
        })()
    })

    Hooks.on("dnd5e.preRollHitDieV2", (context) =>
    {
        logger.debug("dnd5e.preRollHitDieV2 called", context)
        debouncedTracker.pulse("dnd5e.preRollHitDieV2")
        const actor = context?.subject

        if (!actor) return

        const transformation = transformationRegistry.getEntryForActor(actor)
        transformation.TransformationClass.onPreRollHitDie(context, actor)
    })

    Hooks.on("dnd5e.preRollSavingThrow", (context, options, data) =>
    {
        logger.debug("dnd5e.preRollSavingThrow called", context, options, data)
        debouncedTracker.pulse("dnd5e.preRollSavingThrow");
        (async () =>
        {
            const actor = context?.subject

            if (!actor) return

            const transformation = transformationRegistry.getEntryForActor(actor)
            await transformation.TransformationClass.onPreRollSavingThrow(context, actor, { onceService })
        })()
    })

    Hooks.on("dnd5e.rollSavingThrow", (rolls, context) =>
    {
        logger.debug("dnd5e.rollSavingThrow called", rolls, context)
        debouncedTracker.pulse("dnd5e.rollSavingThrow")

        const actor = context.subject
        if (!actor) return

        const roll = rolls?.[0]
        if (!roll) return

        const natural = roll.dice?.[0]?.results?.find(r => r.active == true).result ?? null;

        (async () =>
        {
            await triggerRuntime.run("savingThrow", actor, {
                saves: {
                    current: {
                        ability: context.ability,
                        isSpell: context?.subject?.getFlag("transformations", "saveIsSpell"),
                        naturalRoll: natural,
                        total: roll.total,
                        success: roll.isSuccess
                    }
                }
            })
        })()
    })

    Hooks.on("dnd5e.preUseActivity", (activity, config, options) =>
    {
        logger.debug("dnd5e.preUseActivity called", activity, config, options)
        debouncedTracker.pulse("dnd5e.preUseActivity")

    })

    Hooks.on("dnd5e.preRollDamageV2", args =>
    {
        const workflow = args.workflow
        const rolls = args.rolls
        const item = workflow.item
        const actor = workflow.actor
        const activity = workflow.activity
        const activityFlag = activity?.flags?.transformations?.hookLogic?.preDamageRoll
        const itemFlag = item?.flags?.transformations?.hookLogic?.preDamageRoll
        if (!actor) return

        const transformation = transformationRegistry.getEntryForActor(actor)

        if (itemFlag) {
            const func = transformation.TransformationClass[itemFlag]
            func(workflow, rolls)
        } else if (activityFlag) {
            const func = transformation.TransformationClass[activityFlag]
            func(workflow, rolls)
        } else {
            return
        }
    })

    Hooks.on("renderChatMessage", (message, html) =>
    {
        logger.debug("renderChatMessage called", message)
        debouncedTracker.pulse("renderChatMessage");

        (async () =>
        {
            const actor = game.actors.get(message?.speaker?.actor)
            if (!actor) return

            const transformation = transformationRegistry.getEntryForActor(actor)

            if (!transformation?.TransformationClass?.onRenderChatMessage) return

            await transformation.TransformationClass.onRenderChatMessage({
                message,
                html,
                actor,
                actorRepository,
                dialogFactory,
                logger
            })
        })()
    })
}