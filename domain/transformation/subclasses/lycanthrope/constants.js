export const LYCANTHROPE_BLOODIED_TRIGGER_ITEM_UUID = "Compendium.transformations.gh-transformations.Item.SfMTYtdWXJOeCVX7"

export const LYCANTHROPE_HYBRID_FORM_ITEM_UUIDS = Object.freeze([
    "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo",
    "Compendium.transformations.gh-transformations.Item.CSIQIM4rTZt2eul4",
    "Compendium.transformations.gh-transformations.Item.Wk2EIMS6AcMFoaSv"
])

export const LYCANTHROPE_TRANSFORM_ACTIVITY_NAME = "Midi Transform"

export const LYCANTHROPE_FERAL_HYBRID_EFFECT_NAME = "Feral Hybrid Form"

export const LYCANTHROPE_FERAL_HYBRID_EFFECT_DESCRIPTION =
    "You are in your hybrid form and feral: you can't use equipment or class features, you must move toward the closest creature you can see, smell or hear (prioritizing Bloodied creatures) and attack it with your Claw. This ends when your hybrid form ends, after 1 hour, or with Remove Curse."

export const LYCANTHROPE_FERAL_HYBRID_EFFECT_DURATION_SECONDS = 3600

export const LYCANTHROPE_ULTIMATE_PREDATOR_EFFECT_NAME = "Ultimate Predator"

export const LYCANTHROPE_HYBRID_FORM_FLAG_KEY = "flags.transformations.lycanthrope.hybridForm"

export const LYCANTHROPE_HUNTERS_MARK_FLAG_KEY = "flags.transformations.lycanthrope.huntersMark"

export const LYCANTHROPE_HUNTERS_FOCUS_DAMAGE_FORMULA = "1d6"

/**
 * Activity ids on the pack hybrid form items. The transform activities are unnamed in the
 * pack (their display name depends on dnd5e/midi-qol localization), so they are looked up by id.
 */
export const LYCANTHROPE_HYBRID_FORM_ACTIVITY_IDS = Object.freeze({
    "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo": Object.freeze({
        transform: "fNITPIQWquZlNt8o",
        effect: "1NQ5cRcOCj5yWTmh"
    }),
    "Compendium.transformations.gh-transformations.Item.CSIQIM4rTZt2eul4": Object.freeze({
        transform: "Hk8FlFkkUCGOvdOp",
        effect: "x7UzX9iHXQzT8Ga5"
    }),
    "Compendium.transformations.gh-transformations.Item.Wk2EIMS6AcMFoaSv": Object.freeze({
        transform: "h5uHUvXccVvugBup",
        effect: "39nRebEDhanlBDPI"
    })
})

export const LYCANTHROPE_KINDRED_FORM_ACTIVITY_PREFIX = "Kindred Form"
