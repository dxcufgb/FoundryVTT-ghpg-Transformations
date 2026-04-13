export function createRollModifierAction({ tracker, logger })
{
    logger.debug("createRollModifierAction", { tracker })

    return async function ROLL_MODIFIER({
        actor,
        action,
        context
    })
    {
        logger.debug("createRollModifierAction.ROLL_MODIFIER", {
            actor,
            action,
            context
        })

        return tracker.track((async () =>
            applyRollModifierAction(context, action)
        )())
    }
}

export function applyRollModifierAction(context, action)
{
    const config = resolveConfig(action)
    const mode = config.mode ?? config.type

    if (mode === "remove") {
        if (!context?.rolls) return false

        for (const roll of context.rolls ?? []) {
            roll.parts = roll.parts.map(part =>
            {
                if (typeof part !== "string") return part
                return part.replaceAll(config.string, "").trim()
            })
        }
        return true
    }

    if (mode === "addDamageType") {
        const damageType = config.damageType ?? config.value ?? null
        return addDamageTypeToContext(context, damageType)
    }

    return false
}

function resolveConfig(action)
{
    if (action?.data && typeof action.data === "object") {
        return action.data
    }

    if (action?.mode && typeof action.mode === "object") {
        return action.mode
    }

    return {}
}

function addDamageTypeToContext(context, damageType)
{
    if (typeof damageType !== "string" || damageType.length === 0) {
        return false
    }

    const targets = [
        context?.damage?.current,
        context?.attacks?.current,
        context
    ].filter(Boolean)

    let modified = false

    for (const target of targets) {
        modified = applyDamageTypeToRolls(target?.rolls, damageType) || modified
        modified = applyDamageTypeToParts(target?.activity?.damage?.parts, damageType) || modified
        modified = applyDamageTypeToParts(target?.workflow?.activity?.damage?.parts, damageType) || modified
        modified = applyDamageTypeToParts(target?.itemDocument?.system?.damage?.parts, damageType) || modified
        modified = applyDamageTypeToParts(target?.itemDocument?.system?.damage?.base?.parts, damageType) || modified
        modified = applyDamageTypeToParts(target?.workflow?.item?.system?.damage?.parts, damageType) || modified
        modified = applyDamageTypeToParts(target?.workflow?.item?.system?.damage?.base?.parts, damageType) || modified
    }

    return modified
}

function applyDamageTypeToRolls(rolls, damageType)
{
    if (!Array.isArray(rolls)) return false

    let modified = false

    for (const roll of rolls) {
        roll.options ??= {}
        roll.options.types ??= []

        if (!roll.options.types.includes(damageType)) {
            roll.options.types.push(damageType)
            modified = true
        }
    }

    return modified
}

function applyDamageTypeToParts(parts, damageType)
{
    if (!Array.isArray(parts)) return false

    let modified = false

    for (const part of parts) {
        if (!part) continue

        if (typeof part.types?.add === "function") {
            const initialSize = part.types.size
            part.types.add(damageType)
            if (part.types.size !== initialSize) {
                modified = true
            }
            continue
        }

        if (Array.isArray(part.types)) {
            if (!part.types.includes(damageType)) {
                part.types.push(damageType)
                modified = true
            }
        }
    }

    return modified
}
