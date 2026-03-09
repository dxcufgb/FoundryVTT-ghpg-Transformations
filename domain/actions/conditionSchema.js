/**
 * Evaluate whether an action's conditions are met.
 */
export function conditionsMet(actor, when = {}, context = {}, logger = null)
{
    logger?.debug?.("conditionsMet", { actor, when, context })
    if (!when) return true
    const stageConditions = stageConditionMet(when.stage, context.stage, logger)
    const actorCondition = actorConditionMet(actor, when.actor, logger)
    const itemCondition = itemConditionMet(actor, when.items, logger)
    const effectCondition = effectConditionMet(actor, when.effects, logger)
    const saveCondition = saveConditionMet(context, when, logger)
    const customCondition = customConditionsMet(when.custom, context, logger)

    return (
        stageConditions &&
        actorCondition &&
        itemCondition &&
        effectCondition &&
        saveCondition &&
        customCondition
    )
}

function stageConditionMet(condition, stage, logger = null)
{
    logger?.debug?.("stageConditionMet", { condition, stage })
    if (!condition) return true
    if (stage == null) return false

    if (Array.isArray(condition)) {
        return condition.includes(stage)
    }

    if (typeof condition === "object") {
        if (condition.min != null && stage < condition.min) return false
        if (condition.max != null && stage > condition.max) return false
        return true
    }

    return false
}

function actorConditionMet(actor, condition, logger = null)
{
    logger?.debug?.("actorConditionMet", { actor, condition })
    if (!condition) return true

    if (condition.hasSpellSlots) {
        const slots = actor.system?.spells
        return Object.values(slots ?? {}).some(s => s.max > 0)
    }

    if (condition.hasFlag) {
        const flags = actor.flags.transformations
        return Object.values(flags ?? {}).some(f => f == condition.hasFlag)
    }

    if (condition.notHasFlag) {
        const flags = actor.flags.transformations
        return Object.values(flags ?? {}).none(f => f == condition.notHasFlag)
    }

    if (condition.isBloodied) {
        const hp = actor.system?.attributes?.hp
        return hp && hp.value <= hp.max / 2
    }

    return true
}

function itemConditionMet(actor, condition, logger = null)
{
    logger?.debug?.("itemConditionMet", { actor, condition })
    if (!condition) return true

    const items = actor.items ?? []

    if (condition.has) {
        const allPresent = condition.has.every(requiredUuid =>
            items.some(item =>
                item.flags?.transformations?.sourceUuid === requiredUuid
            )
        )
        if (!allPresent) return false
    }

    if (condition.usesRemaining) {
        const { min = 0, max = Infinity } = condition.usesRemaining

        let item = items.find(i =>
            condition.has?.includes(
                i.flags?.transformations?.sourceUuid
            )
        )

        if (!item) return false

        if (item) {
            item = actor.items.get(item.id) // force fresh instance
        }

        const uses = item.system?.uses
        const remaining = (Number(uses?.max) || 0) - (Number(uses?.spent) || 0)

        if (remaining < min) return false
        if (remaining > max) return false
    }

    return true
}

function effectConditionMet(actor, condition, logger = null)
{
    logger?.debug?.("effectConditionMet", { actor, condition })
    if (!condition) return true

    const effects = actor.effects ?? []

    if (condition.has) {
        return condition.has.every(name =>
            effects.some(e => e.name === name)
        )
    }

    if (condition.missing) {
        return condition.missing.every(name =>
            !effects.some(e => e.name === name)
        )
    }

    return true
}

function saveConditionMet(context, when, logger = null)
{
    logger?.debug?.("saveConditionMet", { context, when })
    if (!when) return true
    const saves = context.saves ?? {}

    if (when.saveFailed) {
        const result = saves[when.saveFailed]
        return result?.success === false
    }

    if (when.saveSucceeded) {
        const result = saves[when.saveSucceeded]
        return result?.success === true
    }

    return true
}

export function customConditionsMet(condition, context, logger = null)
{
    logger?.debug?.("customConditionsMet", { condition, context })

    if (!condition || typeof condition !== "object") return true

    return matchObject(condition, context)
}


// 🔍 Recursive matcher
function matchObject(schema, target)
{
    if (typeof schema !== "object" || schema === null)
        return schema === target

    for (const key of Object.keys(schema)) {

        const expected = schema[key]
        const actual = target?.[key]

        // Nested object → recurse
        if (typeof expected === "object" && !Array.isArray(expected)) {
            if (!matchObject(expected, actual)) {
                return false
            }
            continue
        }

        // Array → includes match
        if (Array.isArray(expected)) {
            if (!expected.includes(actual)) {
                return false
            }
            continue
        }

        // Primitive → strict equality
        if (actual !== expected) {
            return false
        }
    }

    return true
}
