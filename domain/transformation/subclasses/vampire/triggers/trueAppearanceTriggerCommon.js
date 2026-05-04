export const TRUE_APPEARANCE_EFFECT_NAME =
                 "Hiding True Appearance"

export const TRUE_APPEARANCE_SAVE_ITEM_UUID =
                 "Compendium.transformations.gh-transformations.Item.5nFmQkoKj3YFFNuj"

export const TRUE_APPEARANCE_SAVE_ACTIVITY_NAME = "Midi Save"

export const TRUE_APPEARANCE_SAVE_DC_BY_STAGE = Object.freeze({
    3: 16,
    4: 20
})

export const TRUE_APPEARANCE_REVEAL_TRIGGER_TYPES = Object.freeze({
    BECOMING_BLOODIED: "becomingBloodied",
    CONCENTRATING_ON_SPELL: "concentratingOnSpell",
    RADIANT_SUNLIGHT_DAMAGE: "radiantSunlightDamage",
    FEEDING_FRENZY: "feedingFrenzy",
    UNCONSCIOUS: "unconscious",
    HALLOWED_GROUND: "hallowedGround",
    MANUAL_REVEAL: "manualReveal"
})

export const TRUE_APPEARANCE_MANUAL_REVEAL_ACTIVITY_NAMES = Object.freeze([
    "Reveal Yourself",
    "Reveal True Appearance",
    "True Appearance"
])

export function getTrueAppearanceSaveDcForStage(stage)
{
    return TRUE_APPEARANCE_SAVE_DC_BY_STAGE[Number(stage)] ?? null
}

export function createTrueAppearanceSaveActionGroup({
    name,
    when = {}
} = {})
{
    return {
        name,
        when: {
            stage: [3, 4],
            items: {
                has: [TRUE_APPEARANCE_SAVE_ITEM_UUID]
            },
            effects: {
                has: [TRUE_APPEARANCE_EFFECT_NAME]
            },
            ...when
        },
        actions: [
            {
                type: "ITEM_ACTIVITY",
                data: {
                    itemUuid: TRUE_APPEARANCE_SAVE_ITEM_UUID,
                    activityName: TRUE_APPEARANCE_SAVE_ACTIVITY_NAME,
                    blocker: true
                }
            }
        ]
    }
}
