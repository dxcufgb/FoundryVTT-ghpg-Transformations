export const MODULE_NAME = "transformations"
export const MODULE_FOLDER = "modules/transformations/Icons/Transformations/"
export const DDB_IMPORTER_MODULE_NAME = "ddbimporter"
export const TRANSFORMATION_FEATURE = "Transformation Feature"
export const TRANSFORMATION_ITEM_FLAG = "grantedByTransformation"
export const ACTOR_HAS_SPELL_SLOTS = "actorHasSpellSlots"

export const SKILL = Object.freeze({
    ACROBATICS: "acr",
    ANIMAL_HANDLING: "ani",
    ARCANA: "arc",
    ATHLETICS: "ath",
    DECEPTION: "dec",
    HISTORY: "his",
    INSIGHT: "ins",
    INTIMIDATION: "itm",
    INVESTIGATION: "inv",
    MEDICINE: "med",
    NATURE: "nat",
    PERCEPTION: "prc",
    PERFORMANCE: "prf",
    PERSUASION: "per",
    RELIGION: "rel",
    SLEIGHT_OF_HAND: "slt",
    STEALTH: "ste",
    SURVIVAL: "sur"
})

export const ABILITY = Object.freeze({
    STRENGTH: "str",
    DEXTERITY: "dex",
    CONSTITUTION: "con",
    INTELLIGENCE: "int",
    WISDOM: "wis",
    CHARISMA: "cha"
})

export const ROLL_TYPE = Object.freeze({
    ABILITY_CHECK: 0,
    SAVING_THROW: 1
})

export const MOVEMENT_TYPE = Object.freeze({
    BURROW: "burrow",
    CLIMB: "climb",
    FLY: "fly",
    SWIM: "swim",
    WALK: "walk"
})

export const OVERRIDE_TYPE = Object.freeze({
    MOVEMENT_TYPE: "attributes.movement",
    ATTRIBUTES: "attributes"
})

export const ATTRIBUTE = Object.freeze({
    HEALTH_POINTS: "hp.value",
    HEALTH_POINTS_MAX: "hp.max",
    HEALTH_POINTS_EFFECTIVE_MAX: "hp.effectiveMax",
    ROLLABLE: Object.freeze({
        CONCENTRATION: "concentration",
        DEATH_SAVES: "death",
        INITIATIVE: "init"
    })
})

export const ROLL_MODE = Object.freeze({
    ADVANTAGE: { shortText: "adv", int: 1 },
    NORMAL: { shortText: "nor", int: 0 },
    DISADVANTAGE: { shortText: "dis", int: -1 }
})

export const CONDITION = Object.freeze({
    BLOODIED: "bloodied",
    PRONE: "prone",
    STUNNED: "stunned",
    UNCONSCIOUS: "unconscious"
})

export const TRIGGER_FLAG = Object.freeze({
    SPELL_SAVE: "spellSave"
})

export const ITEM_TYPE = Object.freeze({
    SPELL: "spell"
})