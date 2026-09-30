const PHYSICAL_TYPES = new Set(["bludgeoning", "piercing", "slashing"])

/**
 * Lycanthrope Silver Sensitivity: Bludgeoning, Piercing and Slashing damage from silvered
 * weapons ignores Resistance and deals double damage (Vulnerability).
 *
 * Runs on the calculated damages from dnd5e.calculateDamage and adjusts them in place.
 * @returns {boolean} true when any damage was changed.
 */
export function applySilverSensitivity(actor, damages)
{
    if (actor?.flags?.transformations?.silverSensitivity !== true) return false
    if (!Array.isArray(damages)) return false

    let changed = false

    for (const damage of damages) {
        if (!PHYSICAL_TYPES.has(damage?.type)) continue
        if (!hasProperty(damage.properties, "sil")) continue

        damage.active ??= {}
        let factor = 1

        // Silver Sensitivity: no Resistance to damage from silvered weapons.
        if (damage.active.resistance) {
            factor *= 2
            damage.active.resistance = false
        }

        if (!damage.active.vulnerability && !damage.active.immunity) {
            factor *= 2
            damage.active.vulnerability = true
        }

        if (factor === 1) continue

        damage.value *= factor
        damage.active.multiplier = (damage.active.multiplier ?? 1) * factor
        changed = true
    }

    if (!changed) return false

    const amount = damages
        .filter(damage => damage.type !== "temphp")
        .reduce((total, damage) => total + (Number(damage.value) || 0), 0)
    damages.amount = amount > 0 ? Math.floor(amount) : Math.ceil(amount)

    return true
}

function hasProperty(properties, property)
{
    if (!properties) return false
    if (typeof properties.has === "function") return properties.has(property)
    if (Array.isArray(properties)) return properties.includes(property)
    return false
}
