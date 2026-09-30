export const SOUL_VESSEL_NAME = "Soul Vessel"
export const SOUL_VESSEL_SOURCE_UUID =
          "Compendium.transformations.gh-transformations.Item.rluvw9sNdr3JO93n"
export const SOUL_VESSEL_FLAG_PATH = "flags.transformations.lich.soulVesselCharged"

export function isSoulVesselItem(item)
{
    return (
        item?.flags?.transformations?.sourceUuid === SOUL_VESSEL_SOURCE_UUID ||
        item?.name === SOUL_VESSEL_NAME
    )
}

export function findSoulVessel(actor)
{
    const items = actor?.items
    if (!items) return null

    const list = Array.isArray(items) ? items : Array.from(items)

    return (
        list.find(item =>
            item?.flags?.transformations?.sourceUuid === SOUL_VESSEL_SOURCE_UUID
        ) ??
        list.find(item => item?.name === SOUL_VESSEL_NAME) ??
        null
    )
}

/**
 * Remaining charge of a Soul Vessel item, read from its uses.
 * Returns null when the uses cannot be read.
 */
export function getSoulVesselRemainingUses(item)
{
    const uses = item?.system?.uses
    if (!uses) return null

    const value = Number(uses.value)
    if (uses.value != null && Number.isFinite(value)) return value

    const max = Number(uses.max)
    const spent = Number(uses.spent ?? 0)
    if (!Number.isFinite(max) || !Number.isFinite(spent)) return null

    return Math.max(max - spent, 0)
}

/**
 * The vessel is charged while it holds a soul, i.e. while it has a use left.
 * Falls back to the actor flag when the vessel's uses cannot be read.
 */
export function isSoulVesselCharged(actor)
{
    const soulVessel = findSoulVessel(actor)
    if (!soulVessel) return false

    const remaining = getSoulVesselRemainingUses(soulVessel)
    if (remaining != null) return remaining > 0

    return actor?.flags?.transformations?.lich?.soulVesselCharged === true
}
