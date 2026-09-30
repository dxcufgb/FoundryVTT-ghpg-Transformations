// midi-qol names its unnamed activities "Midi Save", "Midi Damage", ... only while its
// activityNamePrefix setting is on (the default). It turns the prefix off when another module
// (blfx) is active, and the user can turn it off too; the same activity is then called "Save".
// Match activity names with and without that prefix so lookups keep working either way.

const MIDI_PREFIX = /^midi\s+/i

export function normalizeActivityName(name)
{
    if (typeof name !== "string") return ""
    return name.trim().replace(MIDI_PREFIX, "").trim().toLowerCase()
}

function normalizeActivityType(type)
{
    if (typeof type !== "string") return ""
    return type.replace(/^midi/i, "").toLowerCase()
}

export function activityMatchesName(activity, name)
{
    if (!activity || typeof name !== "string" || !name) return false

    if (activity.name === name) return true

    const wanted = normalizeActivityName(name)
    if (!wanted) return false

    if (normalizeActivityName(activity.name) === wanted) return true

    // An activity saved without a name shows its type's (possibly localized) title, so fall back
    // to the type: "Midi Save" matches an unnamed "save" or "midiSave" activity.
    const storedName = activity._source?.name ?? activity.name
    if (!storedName || storedName === "") {
        return normalizeActivityType(activity.type) === wanted
    }

    return false
}

export function findActivityByName(item, name)
{
    const activities = item?.system?.activities
    if (!activities) return null

    const list = typeof activities.values === "function"
        ? Array.from(activities.values())
        : Array.isArray(activities)
            ? activities
            : Object.values(activities)

    return list.find(activity => activity?.name === name) ??
        list.find(activity => activityMatchesName(activity, name)) ??
        null
}
