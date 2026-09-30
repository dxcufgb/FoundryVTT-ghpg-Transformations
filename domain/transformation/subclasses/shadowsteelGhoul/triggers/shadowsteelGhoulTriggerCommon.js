export const SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID =
                 "Compendium.transformations.gh-transformations.Item.chksYSoa3648qwfi"

export const SHADOWSTEEL_GHOUL_TRIGGER_ACTIVITY_NAME = "Midi Save"

// Shadowsteel Explosion fires the first time the ghoul is Bloodied OR reduced to 0 HP after a rest,
// so both triggers share a single once-per-rest key.
export const SHADOWSTEEL_GHOUL_EXPLOSION_ONCE_KEY =
                 "shadowsteelGhoulExplosionMidiSave"

const SHADOWSTEEL_GHOUL_TRIGGER_RESETS = Object.freeze([
    "shortRest",
    "longRest"
])

export function createShadowsteelGhoulTriggerActionGroup({
    name,
    onceKey
} = {})
{
    return {
        name,
        when: {
            items: {
                has: [
                    SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID
                ]
            }
        },
        actions: [
            {
                type: "ITEM_ACTIVITY",
                once: {
                    key: onceKey,
                    reset: SHADOWSTEEL_GHOUL_TRIGGER_RESETS
                },
                data: {
                    itemUuid: SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID,
                    activityName: SHADOWSTEEL_GHOUL_TRIGGER_ACTIVITY_NAME,
                    blocker: true
                }
            }
        ]
    }
}
