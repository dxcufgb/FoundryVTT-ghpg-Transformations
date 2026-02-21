export function registerDnd5eHooks({
    transformationService,
    triggerRuntime,
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

            const onceFlags = actor.getFlag("transformations", "once")
            if (onceFlags) {
                const updated = { ...onceFlags }
                let changed = false

                for (const [key, entry] of Object.entries(updated)) {

                    if (!Array.isArray(entry.reset)) continue

                    const shouldReset =
                        (isLong && entry.reset.includes("longRest")) ||
                        (isShort && entry.reset.includes("shortRest"))

                    if (shouldReset) {
                        delete updated[key]
                        changed = true
                    }
                }

                if (changed) {
                    if (Object.keys(updated).length === 0) {
                        await actor.unsetFlag("transformations", "once")
                    } else {
                        await actor.setFlag("transformations", "once", updated)
                    }
                }
            }
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
        debouncedTracker.pulse("dnd5e.preRollHitDieV2");
        (async () =>
        {
            console.log("not implemented")
            // return transformationService.onHitDieRoll(
            //     context
            // )
        })()
    })

    Hooks.on("dnd5e.preRollSavingThrow", (context, options, data) =>
    {
        logger.debug("dnd5e.preRollSavingThrow called", context, options, data)
        debouncedTracker.pulse("dnd5e.preRollSavingThrow");
        (async () =>
        {
            if (context.workflow?.item?.type !== "spell") return
            context.subject.setFlag("transformations", "saveIsSpell", true)
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

        const natural = roll.dice?.[0]?.results?.find(r => r.active == true)?.result

            (async () =>
            {
                await triggerRuntime.run("savingThrow", actor, {
                    ability: context.ability,
                    isSpell: context?.subject?.getFlag("transformations", "saveIsSpell"),
                    naturalRoll: natural,
                    total: roll.total
                })
            })()
    })
}