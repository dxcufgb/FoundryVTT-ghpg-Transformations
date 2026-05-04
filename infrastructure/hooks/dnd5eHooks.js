import { conditionsMet } from "../../domain/actions/conditionSchema.js"
import { applyRollModifierAction } from "../../services/actions/handlers/rollModifier.js"

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

function resolveDamageTypeMap(actor)
{
    return actor?.getFlag?.("transformations", "damageTypePerMidiId") ?? {}
}

function resolveDamageTypeFromDetails(damageDetails)
{
    if (Array.isArray(damageDetails)) {
        return damageDetails.find(detail =>
            typeof detail?.type === "string" && detail.type.length > 0
        )?.type ?? null
    }

    return typeof damageDetails?.type === "string" && damageDetails.type.length > 0
        ? damageDetails.type
        : null
}

function updateDamageTypePerMidiId({
    actor,
    midiId,
    damageType = null,
    logger
} = {})
{
    if (!actor?.setFlag || !midiId) {
        return
    }

    const current = {
        ...resolveDamageTypeMap(actor)
    }

    if (damageType) {
        current[midiId] = damageType
    } else {
        delete current[midiId]
    }

    const result = actor.setFlag(
        "transformations",
        "damageTypePerMidiId",
        current
    )

    if (typeof result?.catch === "function") {
        result.catch(error =>
            logger?.warn?.("Failed to update damageTypePerMidiId", error)
        )
    }
}

function resolveTriggeringUserId(...values)
{
    for (const value of values) {
        const resolved = walkUserId(value)
        if (resolved) return resolved
    }

    return null
}

function walkUserId(value)
{
    if (!value) return null

    if (typeof value === "string") {
        return value.length > 0
            ? value
            : null
    }

    if (typeof value !== "object") return null

    const directCandidates = [
        value.userId,
        value.user?.id,
        value.author?.id,
        value.event?.userId,
        value.options?.userId,
        value.chatMessage?.user?.id,
        value.chatMessage?.author?.id,
        value.card?.user?.id,
        value.card?.author?.id,
        value.message?.user?.id,
        value.message?.author?.id
    ]

    for (const candidate of directCandidates) {
        if (typeof candidate === "string" && candidate.length > 0) {
            return candidate
        }
    }

    return null
}

function isAttackRollConfig(candidate)
{
    return Boolean(
        candidate &&
        typeof candidate === "object" &&
        (
            "subject" in candidate ||
            "rolls" in candidate ||
            "hookNames" in candidate ||
            "attackMode" in candidate
        )
    )
}

async function resolveItemFromContext(context)
{
    const actor = resolveActorFromSubject(context?.subject)
    const workflowItem = context?.workflow?.item ?? null

    if (workflowItem) {
        await clearSavedItemReference(actor)
        return normalizeTriggerItem(workflowItem)
    }

    const savedItemUuid =
              actor?.flags?.transformations?.saveItemUuid ??
              actor?.getFlag?.("transformations", "saveItemUuid") ??
              null

    if (!savedItemUuid) {
        await clearSavedItemReference(actor)
        return null
    }

    const uuidResolver =
              globalThis?.fromUuid ??
              (typeof fromUuid === "function" ? fromUuid : null)

    const item = uuidResolver
        ? await uuidResolver(savedItemUuid)
        : null

    await clearSavedItemReference(actor)

    return normalizeTriggerItem(item, savedItemUuid)
}

function normalizeTriggerItem(item, fallbackSourceUuid = null)
{
    if (!item && !fallbackSourceUuid) return null

    const sourceUuid =
              item?.flags?.transformations?.sourceUuid ??
              fallbackSourceUuid ??
              null

    return {
        id: item?.id ?? null,
        name: item?.name ?? null,
        uuid: item?.uuid ?? sourceUuid,
        sourceUuid
    }
}

async function clearSavedItemReference(actor)
{
    if (!actor) return

    if (typeof actor.unsetFlag === "function") {
        await actor.unsetFlag("transformations", "saveItemUuid")
        return
    }

    if (typeof actor.setFlag === "function") {
        await actor.setFlag("transformations", "saveItemUuid", null)
    }
}

function resolvePreRollDamageInvocation(configOrArgs = {}, dialog = null, message = null)
{
    const workflow = configOrArgs?.workflow ?? null
    const subject =
              configOrArgs?.subject ??
              workflow?.activity ??
              configOrArgs?.activity ??
              null
    const activity = workflow?.activity ?? subject ?? null
    const item =
              workflow?.item ??
              activity?.item ??
              configOrArgs?.item ??
              subject?.item ??
              null
    const actor =
              workflow?.actor ??
              resolveActorFromSubject(
                  subject ??
                  item ??
                  configOrArgs?.actor ??
                  null
              )

    return {
        actor,
        item,
        activity,
        rolls: Array.isArray(configOrArgs?.rolls) ? configOrArgs.rolls : [],
        workflow: workflow ?? buildSyntheticPreRollDamageWorkflow({
            actor,
            item,
            activity
        }),
        config: configOrArgs?.subject ? configOrArgs : null,
        dialog,
        message
    }
}

function buildSyntheticPreRollDamageWorkflow({
    actor,
    item,
    activity
} = {})
{
    if (!actor && !item && !activity) return null

    return {
        actor,
        item,
        activity
    }
}

function buildPreRollDamageTriggerContext({
    activity,
    item,
    rolls,
    workflow,
    config = null,
    dialog = null,
    message = null
} = {})
{
    return {
        damage: {
            current: {
                activity,
                item: normalizeTriggerItem(item),
                itemDocument: item,
                rolls,
                workflow,
                config,
                dialog,
                message
            }
        }
    }
}

function buildActivityUseTriggerContext(activity, usage)
{
    const item =
              usage?.workflow?.item ??
              activity?.parent?.parent ??
              activity?.parent ??
              null

    return {
        activities: {
            current: {
                activity: {
                    id: activity?.id ?? activity?._id ?? null,
                    name: activity?.name ?? "",
                    type: activity?.type ?? ""
                },
                item: {
                    ...normalizeTriggerItem(item),
                    type: item?.type ?? "",
                    systemType: item?.system?.type?.value ?? "",
                    systemSubType: item?.system?.type?.subtype ?? ""
                }
            }
        }
    }
}

function getTransformationStage(actor)
{
    const rawStage =
              actor?.flags?.transformations?.stage ??
              actor?.getFlag?.("transformations", "stage") ??
              0
    const numericStage = Number(rawStage ?? 0)

    return Number.isFinite(numericStage)
        ? Math.max(numericStage, 0)
        : 0
}

function applySynchronousPreRollDamageActions({
    actor,
    transformation,
    context,
    logger
} = {})
{
    const actionGroups =
              transformation?.TransformationTriggers?.preRollDamage?.actionGroups ??
              []

    if (!actor || !actionGroups.length) {
        return false
    }

    const evaluationContext = {
        ...context,
        trigger: "preRollDamage",
        stage: getTransformationStage(actor)
    }

    let modified = false

    for (const actionGroup of actionGroups) {
        if (!conditionsMet(actor, actionGroup?.when, evaluationContext, logger)) {
            continue
        }

        for (const action of actionGroup?.actions ?? []) {
            if (action?.type !== "ROLL_MODIFIER") continue

            modified = applyRollModifierAction(context, action) || modified
        }
    }

    return modified
}

export function registerDnd5eHooks({
    transformationService,
    transformationRegistry,
    actorRepository,
    activeEffectRepository,
    itemRepository,
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

    Hooks.on("dnd5e.restCompleted", (actor, result, config) =>
    {
        logger.debug("dnd5e.restCompleted called", actor, result, config)
        debouncedTracker.pulse("dnd5e.restCompleted")
        tracker.track((async () =>
        {
            const isLong = result.longRest === true
            const isShort = result.shortRest === true || result.type === "short"
            const triggeringUserId = resolveTriggeringUserId(config, result)

            onceService.resetFlagsOnRest(actor, {isLong, isShort})
            if (isShort) {
                await triggerRuntime.run("shortRest", actor, {
                    triggeringUserId
                })
            } else if (isLong) {
                await triggerRuntime.run("longRest", actor, {
                    triggeringUserId
                })
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
        logger.debug("dnd5e.preRollInitiative called", actor, roll)
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
        logger.debug("dnd5e.rollAbilityCheck called", rolls, context)
        handleGenericD20Roll({
            hookName: "dnd5e.rollAbilityCheck",
            actor: resolveActorFromSubject(context?.subject),
            rolls,
            data: context
        })
    })

    Hooks.on("dnd5e.rollSkill", (rolls, context) =>
    {
        logger.debug("dnd5e.rollSkill called", rolls, context)
        handleSkillRoll("dnd5e.rollSkill", rolls, context)
    })

    Hooks.on("dnd5e.rollSkillV2", (rolls, context) =>
    {
        logger.debug("dnd5e.rollSkillV2 called", rolls, context)
        handleSkillRoll("dnd5e.rollSkillV2", rolls, context)
    })

    Hooks.on("dnd5e.rollToolCheck", (rolls, data) =>
    {
        logger.debug("dnd5e.rollToolCheck called", rolls, data)
        handleGenericD20Roll({
            hookName: "dnd5e.rollToolCheck",
            actor: resolveActorFromSubject(data?.subject),
            rolls,
            data
        })
    })

    Hooks.on("dnd5e.preRollAttack", (itemOrRollConfig, rollConfigOrDialog, message) =>
    {
        logger.debug(
            "dnd5e.preRollAttack called",
            itemOrRollConfig,
            rollConfigOrDialog,
            message
        )
        debouncedTracker.pulse("dnd5e.preRollAttack")

        ;(async () =>
    {
        const rollConfig = isAttackRollConfig(itemOrRollConfig)
            ? itemOrRollConfig
            : rollConfigOrDialog
        const dialog = isAttackRollConfig(itemOrRollConfig)
            ? rollConfigOrDialog
            : null
        const item = isAttackRollConfig(itemOrRollConfig)
            ? rollConfig?.subject?.item ?? null
            : itemOrRollConfig
        const actor = resolveActorFromSubject(
            rollConfig?.subject ??
            item ??
            null
        )

        if (!actor) return

        const transformation = transformationRegistry.getEntryForActor(actor)

        if (!transformation?.TransformationClass?.onPreRollAttack) return

        await transformation.TransformationClass.onPreRollAttack({
            item,
            rollConfig,
            dialog,
            message,
            actor,
            actorRepository,
            itemRepository,
            logger
        })
    })()
    })

    Hooks.on("dnd5e.rollAttack", (rolls, data) =>
    {
        logger.debug("dnd5e.rollAttack called", rolls, data)
        handleGenericD20Roll({
            hookName: "dnd5e.rollAttack",
            actor: resolveActorFromSubject(data?.subject),
            rolls,
            data
        })
    })

    Hooks.on("dnd5e.rollConcentration", (rolls, data) =>
    {
        logger.debug("dnd5e.rollConcentration called", rolls, data)
        handleGenericD20Roll({
            hookName: "dnd5e.rollConcentration",
            actor: resolveActorFromSubject(data?.subject),
            rolls,
            data
        })
    })

    Hooks.on("dnd5e.rollDeathSave", (rolls, data) =>
    {
        logger.debug("dnd5e.rollDeathSave called", rolls, data)
        handleGenericD20Roll({
            hookName: "dnd5e.rollDeathSave",
            actor: resolveActorFromSubject(data?.subject),
            rolls,
            data
        })
    })

    function handlePreUseActivity(
        hookName,
        activity,
        usageConfig,
        dialogConfig,
        messageConfig
    )
    {
        logger.debug(`${hookName} called`, activity, usageConfig, dialogConfig, messageConfig)
        debouncedTracker.pulse(hookName)

        const actor = resolveActorFromSubject(
            activity ??
            usageConfig?.subject ??
            usageConfig?.workflow?.actor ??
            null
        )
        if (!actor) return

        const transformation = transformationRegistry.getEntryForActor(actor)

        if (!transformation?.TransformationClass?.onPreUseActivity) return

        const result = transformation.TransformationClass.onPreUseActivity({
            activity,
            usageConfig,
            dialogConfig,
            messageConfig,
            actor,
            actorRepository,
            itemRepository,
            logger
        })

        if (typeof result?.catch === "function") {
            result.catch(error =>
                logger.warn?.("dnd5e.preUseActivity failed", error)
            )
        }
    }

    Hooks.on("dnd5e.preUseActivity", (activity, usageConfig, dialogConfig, messageConfig) =>
    {
        handlePreUseActivity(
            "dnd5e.preUseActivity",
            activity,
            usageConfig,
            dialogConfig,
            messageConfig
        )
    })

    Hooks.on("dnd5e.preActivityUse", (activity, usageConfig, dialogConfig, messageConfig) =>
    {
        handlePreUseActivity(
            "dnd5e.preActivityUse",
            activity,
            usageConfig,
            dialogConfig,
            messageConfig
        )
    })

    Hooks.on("dnd5e.preRollDamageV2", (configOrArgs, dialog, message) =>
    {
        logger.debug("dnd5e.preRollDamageV2 called", configOrArgs, dialog, message)
        debouncedTracker.pulse("dnd5e.preRollDamageV2")
        const {
                  actor,
                  item,
                  activity,
                  rolls,
                  workflow,
                  config
              } = resolvePreRollDamageInvocation(configOrArgs, dialog, message)
        const activityFlag = activity?.flags?.transformations?.hookLogic?.preDamageRoll
        const itemFlag = item?.flags?.transformations?.hookLogic?.preDamageRoll
        if (!actor) return

        const transformation = transformationRegistry.getEntryForActor(actor)
        const triggerContext = buildPreRollDamageTriggerContext({
            activity,
            item,
            rolls,
            workflow,
            config,
            dialog,
            message
        })

        applySynchronousPreRollDamageActions({
            actor,
            transformation,
            context: triggerContext,
            logger
        })

        ;(async () =>
    {
        if (itemFlag) {
            const func = transformation?.TransformationClass?.[itemFlag]
            await func?.(workflow, rolls)
        } else if (activityFlag) {
            const func = transformation?.TransformationClass?.[activityFlag]
            await func?.(workflow, rolls)
        }

        await transformation?.TransformationClass?.onPreRollDamage?.({
            actor,
            item,
            activity,
            rolls,
            workflow,
            config,
            dialog,
            message,
            actorRepository,
            itemRepository,
            logger
        })

        await triggerRuntime.run("preRollDamage", actor, {
            ...triggerContext
        })
    })()
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
                activeEffectRepository,
                dialogFactory,
                ChatMessagePartInjector,
                RollService,
                logger
            })
        })()
    })

    Hooks.on("dnd5e.postUseActivity", async (activity, usage, changes) => {
        logger.debug("dnd5e.postUseActivity called", activity, usage, changes)
        const actor = usage.workflow.actor
        if (!actor) return
        const triggeringUserId = resolveTriggeringUserId(
            changes?.message,
            usage?.message,
            usage?.workflow,
            usage,
            changes
        )

        if (triggeringUserId && triggeringUserId !== game.user?.id) {
            return
        }

        const transformation = transformationRegistry.getEntryForActor(actor)

        let activityUseResult = null

        if (transformation?.TransformationClass?.onActivityUse) {
            activityUseResult = await transformation.TransformationClass.onActivityUse(
                activity,
                usage,
                changes.message,
                actorRepository,
                ChatMessagePartInjector,
                itemRepository,
                dialogFactory,
                triggeringUserId
            )
        }

        if (
            activityUseResult?.skipActivityUseTrigger === true ||
            usage?.flags?.transformations?.skipActivityUseTrigger === true
        ) {
            return
        }

        await triggerRuntime.run(
            "activityUse",
            actor,
            buildActivityUseTriggerContext(activity, usage)
        )

    })
    Hooks.on("dnd5e.preCalculateDamage", (target, damageDetails, details) => {
        const actor = resolveActorFromSubject(target)
        if (!actor) return

        const midiId = details?.midi?.sourceActorUuid ?? null
        const damageType = resolveDamageTypeFromDetails(damageDetails)
        if (!midiId || !damageType) return

        updateDamageTypePerMidiId({
            actor,
            midiId,
            damageType,
            logger
        })
    })

    Hooks.on("dnd5e.applyDamage", (target, damage, details) => {
        logger.debug("dnd5e.applyDamage called", target, damage, details)
        debouncedTracker.pulse("dnd5e.applyDamage")

        const actor = resolveActorFromSubject(target)
        if (!actor) return

        const midiId = details?.midi?.sourceActorUuid ?? null
        const transformation = transformationRegistry.getEntryForActor(actor)
        if (transformation?.TransformationClass?.onPreCalculateDamage) {
            const result = transformation.TransformationClass.onPreCalculateDamage({
                actor,
                target,
                damage,
                details,
                actorRepository,
                itemRepository,
                activeEffectRepository,
                ChatMessagePartInjector,
                RollService,
                logger
            })

            if (typeof result?.catch === "function") {
                result.catch(error =>
                    logger.warn?.("dnd5e.preCalculateDamage failed", error)
                )
            }
        }

        updateDamageTypePerMidiId({
            actor,
            midiId,
            damageType: null,
            logger
        })
    });
}
