export function resolveDamageResistanceGrantType({
    actor,
    sourceItem,
    damageType
} = {})
{
    const advancementOverride =
        sourceItem?.flags?.transformations?.advancementOverride
    const hasUpgradeOverride =
        advancementOverride === "upgrade" ||
        advancementOverride?.upgrade === true

    if (!hasUpgradeOverride) {
        return "resistance"
    }

    return actorHasTraitValue(actor?.system?.traits?.dr?.value, damageType)
        ? "immunity"
        : "resistance"
}

function actorHasTraitValue(traitValues, expectedValue)
{
    if (!traitValues || !expectedValue) return false

    if (traitValues instanceof Set) {
        return traitValues.has(expectedValue)
    }

    if (Array.isArray(traitValues)) {
        return traitValues.includes(expectedValue)
    }

    if (typeof traitValues.has === "function") {
        return traitValues.has(expectedValue)
    }

    return false
}
