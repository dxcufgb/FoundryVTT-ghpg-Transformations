function getPrimaryRoll(rolls)
{
    if (Array.isArray(rolls)) return rolls[0] ?? null
    return rolls ?? null
}

function getNaturalRoll(roll)
{
    const d20Die =
              roll?.dice?.find(die =>
                  Number(die?.faces ?? 0) === 20 ||
                  Number(die?.number ?? 0) === 20
              ) ??
              roll?.dice?.[0]

    const activeResult =
              d20Die?.results?.find(result => result?.active === true) ??
              d20Die?.results?.[0]

    return activeResult?.result ?? null
}

function resolveActorFromSubject(subject)
{
    return (
        subject?.actor ??
        subject?.item?.actor ??
        subject?.parent?.actor ??
        subject?.parent ??
        subject ??
        null
    )
}

async function resolveItemFromContext(context)
{
    const item = await fromUuid(context.subject.flags?.transformations?.saveItemUuid)
    await context.subject.unsetFlag("transformations", "saveItemUuid")
    if (!item) return
    return item
}

export function registerDnd5eHooks({
    transformationService,
    transformationRegistry,
    actorRepository,
    dialogFactory,
    triggerRuntime,
    onceService,
    tracker,
    debouncedTracker,
    ChatMessagePartInjector,
    RollService,
    logger
})
{
    logger.debug("registerDnd5eHooks", {
        transformationService,
        triggerRuntime,
        debouncedTracker
    })

    const processedRollFamilies = new WeakMap()

    function hasProcessedRoll(roll, family)
    {
        if (!roll || typeof roll !== "object") return false

        let processedFamilies = processedRollFamilies.get(roll)
        if (!processedFamilies) {
            processedFamilies = new Set()
            processedRollFamilies.set(roll, processedFamilies)
        }

        if (processedFamilies.has(family)) return true

        processedFamilies.add(family)
        return false
    }

    async function dispatchTransformationRoll({
        hookName,
        actor,
        rolls,
        roll = getPrimaryRoll(rolls),
        data = null,
        context = null
    })
    {
        if (!actor || !roll) return
        if (hasProcessedRoll(roll, "transformationRoll")) return

        const transformation = transformationRegistry.getEntryForActor(actor)
        if (!transformation?.TransformationClass?.onRoll) return

        await transformation.TransformationClass.onRoll(actor, {
            hookName,
            natural: getNaturalRoll(roll),
            total: roll.total,
            roll,
            rolls,
            data,
            context
        })
    }

    function handleGenericD20Roll({
        hookName,
        pulseName = hookName,
        actor,
        rolls,
        roll = getPrimaryRoll(rolls),
        data = null,
        context = null
    })
    {
        logger.debug(`${hookName} called`, rolls ?? roll, data ?? context)
        debouncedTracker.pulse(pulseName)

        if (!actor || !roll) return
            ;
        (async () =>
        {
            await dispatchTransformationRoll({
                hookName,
                actor,
                rolls,
                roll,
                data,
                context
            })
        })()
    }

    function handleSkillRoll(hookName, rolls, context)
    {
        const actor = resolveActorFromSubject(context?.subject)
        const roll = getPrimaryRoll(rolls)

        logger.debug(`${hookName} called`, rolls, context)
        debouncedTracker.pulse("dnd5e.rollSkill")

        if (!actor || !roll) return

        const natural = getNaturalRoll(roll)

        ;(async () =>
    {
        await dispatchTransformationRoll({
            hookName,
            actor,
            rolls,
            roll,
            context
        })

        if (hasProcessedRoll(roll, "skillCheck")) return

        await triggerRuntime.run("skillCheck", actor, {
            checks: {
                current: {
                    ability: context.ability,
                    skill: context.skill,
                    naturalRoll: natural,
                    total: roll.total
                }
            }
        })
    })()
    }

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

            onceService.resetFlagsOnRest(actor, {isLong, isShort})
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

    Hooks.on("dnd5e.preRollInitiative", (actor, roll) =>
    {
        handleGenericD20Roll({
            hookName: "dnd5e.preRollInitiative",
            actor,
            roll,
            rolls: [roll]
        })
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
            await transformation.TransformationClass.onPreRollSavingThrow(context, actor, {onceService})
        })()
    })

    Hooks.on("dnd5e.rollSavingThrow", (rolls, context) =>
    {
        logger.debug("dnd5e.rollSavingThrow called", rolls, context)
        debouncedTracker.pulse("dnd5e.rollSavingThrow")

        const actor = resolveActorFromSubject(context?.subject)
        if (!actor) return

        const roll = getPrimaryRoll(rolls)
        if (!roll) return

        const natural = getNaturalRoll(roll);

        (async () =>
        {
            const item = await resolveItemFromContext(context)

            await dispatchTransformationRoll({
                hookName: "dnd5e.rollSavingThrow",
                actor,
                rolls,
                roll,
                context
            })

            await triggerRuntime.run("savingThrow", actor, {
                saves: {
                    current: {
                        ability: context.ability,
                        isSpell: context?.subject?.getFlag("transformations", "saveIsSpell"),
                        item: item,
                        naturalRoll: natural,
                        total: roll.total,
                        success: roll.isSuccess
                    }
                }
            })
        })()
    })

    Hooks.on("dnd5e.rollAbilityCheck", (rolls, context) =>
    {
        handleGenericD20Roll({
            hookName: "dnd5e.rollAbilityCheck",
            actor: resolveActorFromSubject(context?.subject),
            rolls,
            data: context
        })
    })

    Hooks.on("dnd5e.rollSkill", (rolls, context) =>
    {
        handleSkillRoll("dnd5e.rollSkill", rolls, context)
    })

    Hooks.on("dnd5e.rollSkillV2", (rolls, context) =>
    {
        handleSkillRoll("dnd5e.rollSkillV2", rolls, context)
    })

    Hooks.on("dnd5e.rollToolCheck", (rolls, data) =>
    {
        handleGenericD20Roll({
            hookName: "dnd5e.rollToolCheck",
            actor: resolveActorFromSubject(data?.subject),
            rolls,
            data
        })
    })

    Hooks.on("dnd5e.rollAttack", (rolls, data) =>
    {
        handleGenericD20Roll({
            hookName: "dnd5e.rollAttack",
            actor: resolveActorFromSubject(data?.subject),
            rolls,
            data
        })
    })

    Hooks.on("dnd5e.rollConcentration", (rolls, data) =>
    {
        handleGenericD20Roll({
            hookName: "dnd5e.rollConcentration",
            actor: resolveActorFromSubject(data?.subject),
            rolls,
            data
        })
    })

    Hooks.on("dnd5e.rollDeathSave", (rolls, data) =>
    {
        handleGenericD20Roll({
            hookName: "dnd5e.rollDeathSave",
            actor: resolveActorFromSubject(data?.subject),
            rolls,
            data
        })
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

        }
    })

    Hooks.on("renderChatMessageHTML", (message, html) =>
    {
        logger.debug("renderChatMessageHTML called", message, html)
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
                ChatMessagePartInjector,
                RollService,
                logger
            })
        })()
    })

    Hooks.on("dnd5e.postUseActivity", async (activity, usage, changes) => {

        const actor = usage.workflow.actor
        if (!actor) return

        const transformation = transformationRegistry.getEntryForActor(actor)

        if (!transformation?.TransformationClass?.onActivityUse) return

        await transformation.TransformationClass.onActivityUse(
            activity,
            usage,
            changes.message,
            actorRepository,
            ChatMessagePartInjector
        )

    })
}
