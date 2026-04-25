const appliedModifierKeyRegistry = new WeakMap()

export function createRollModifierAction({tracker, logger})
{
    logger.debug("createRollModifierAction", {tracker})

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

    if (mode === "addFlatBonus") {
        const bonus = config.bonus ?? config.value ?? null
        return addFlatBonusToContext(context, bonus, config.key ?? null)
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

function addFlatBonusToContext(context, bonus, modifierKey = null)
{
    const numericBonus = Number(bonus)
    if (!Number.isFinite(numericBonus) || numericBonus === 0) {
        return false
    }

    const rollCollections = [
        context?.damage?.current?.rolls,
        context?.attacks?.current?.rolls,
        context?.rolls
    ]

    let modified = false

    for (const rolls of rollCollections) {
        if (!Array.isArray(rolls)) continue

        for (const roll of rolls) {
            modified =
                applyFlatBonusToRoll(roll, numericBonus, modifierKey) ||
                modified
        }
    }

    return modified
}

function applyFlatBonusToRoll(roll, bonus, modifierKey = null)
{
    if (!roll || typeof roll !== "object") {
        return false
    }

    const appliedModifierKeys = getAppliedModifierKeys(roll)
    if (modifierKey && appliedModifierKeys.has(modifierKey)) {
        return false
    }

    const formattedBonus = formatFlatBonus(bonus)
    let modified = false

    if (Array.isArray(roll.parts)) {
        roll.parts.push(formattedBonus)
    } else if (typeof roll.formula === "string") {
        roll.formula = `${roll.formula} ${formattedBonus}`.trim()
        modified = true

        if (typeof roll._formula === "string") {
            roll._formula = `${roll._formula} ${formattedBonus}`.trim()
        }
    }

    if (modified && modifierKey) {
        appliedModifierKeys.add(modifierKey)
    }

    return modified
}

function formatFlatBonus(bonus)
{
    return bonus >= 0
        ? `+ ${bonus}`
        : `- ${Math.abs(bonus)}`
}

function getAppliedModifierKeys(roll)
{
    if (appliedModifierKeyRegistry.has(roll)) {
        return appliedModifierKeyRegistry.get(roll)
    }

    const appliedModifierKeys = new Set()
    appliedModifierKeyRegistry.set(roll, appliedModifierKeys)
    return appliedModifierKeys
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
