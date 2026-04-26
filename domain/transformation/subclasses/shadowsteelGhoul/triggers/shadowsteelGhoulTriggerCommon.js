export const SHADOWSTEEL_GHOUL_TRIGGER_ITEM_UUID =
                 "Compendium.transformations.gh-transformations.Item.chksYSoa3648qwfi"

export const SHADOWSTEEL_GHOUL_TRIGGER_ACTIVITY_NAME = "Midi Save"

export const SHADOWSTEEL_GHOUL_BLOODIED_ONCE_KEY =
                 "shadowsteelGhoulBloodiedMidiSave"

export const SHADOWSTEEL_GHOUL_ZERO_HP_ONCE_KEY =
                 "shadowsteelGhoulZeroHpMidiSave"

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
