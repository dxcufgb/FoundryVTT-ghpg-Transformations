import { Transformation } from "../../Transformation.js"

const FRAYING_REALITY_DAMAGE_ITEM_UUID =
    "Compendium.transformations.gh-transformations.Item.gIZ5Gzc4nCAkiUQ6"
const FRAYING_REALITY_DAMAGE_ACTIVITY_NAME = "Midi Damage"

function resolveItemActivities(item)
{
    const activities = item?.system?.activities

    if (!activities) return []

    if (Array.isArray(activities)) {
        return activities.filter(Boolean)
    }

    if (Array.isArray(activities?.contents)) {
        return activities.contents.filter(Boolean)
    }

    if (typeof activities?.values === "function") {
        return Array.from(activities.values()).filter(Boolean)
    }

    if (typeof activities?.[Symbol.iterator] === "function") {
        return Array.from(activities).filter(Boolean)
    }

    if (typeof activities === "object") {
        return Object.values(activities).filter(activity =>
            activity &&
            typeof activity === "object"
        )
    }

    return []
}

function resolveItemActivityByName(item, activityName)
{
    return resolveItemActivities(item).find(activity =>
        activity?.name === activityName
    ) ?? null
}

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Specter extends Transformation
{
    static type = "specter"
    static displayName = "Specter"
    static itemId = "specter"
    static uuid = "Compendium.transformations.gh-transformations.Item.FtsHDriWg4I349FW"

    static async onRoll(actor, roll)
    {
        if (!actor || roll?.natural !== 1) return

        const item = actor.items.find(entry =>
            entry?.flags?.transformations?.sourceUuid ===
            FRAYING_REALITY_DAMAGE_ITEM_UUID
        ) ?? null

        if (!item) return

        const activity = resolveItemActivityByName(
            item,
            FRAYING_REALITY_DAMAGE_ACTIVITY_NAME
        )

        if (typeof activity?.use !== "function") return

        await activity.use()
    }
}
