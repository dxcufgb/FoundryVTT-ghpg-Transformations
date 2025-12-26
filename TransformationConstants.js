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
    SLEIGHT_OF_HAND: "slh",
    STEALTH: "ste",
    SURVIVAL: "sur",
    contains(value) {
        return Object.values(this).includes(value);
    }
});

export const ABILITY = Object.freeze({
    STRENGTH: "str",
    DEXTERITY: "dex",
    CONSTITUTION: "con",
    INTELLIGENCE: "int",
    WISDOM: "wis",
    CHARISMA: "cha",
    contains(value) {
        return Object.values(this).includes(value);
    }
});

export const ROLL_TYPE = Object.freeze({
    ABILITY_CHECK: 0,
    SAVING_THROW: 1,
    contains(value) {
        return Object.values(this).includes(value);
    }
});

export const MOVEMENT_TYPE = Object.freeze({
    BURROW: "burrow",
    CLIMB: "climb",
    FLY: "fly",
    SWIM: "swim",
    WALK: "walk",
    contains(value) {
        return Object.values(this).includes(value);
    }
});

export const OVERRIDE_TYPE = Object.freeze({
    MOVEMENT_TYPE: "attributes.movement",
    ATTRIBUTES: "attributes",
    contains(value) {
        return Object.values(this).includes(value);
    }
});

export const ATTRIBUTE = Object.freeze({
    HEALT_POINTS: "hp.value",
    HEALT_POINTS_MAX: "hp.max",
    ROLLABLE: Object.freeze({
        CONCENTRATION: "concentration",
        DEATH_SAVES: "death",
        INITIATIVE: "init",
        contains(value) {
            return Object.values(this).includes(value);
        }
    }),
    contains(value) {
        return Object.values(this).includes(value);
    }
});

export const TRANSFORMATIONS = Object.freeze({
    ABERRANT_HORROR: "Aberrant Horror",
    FEY: "Fey",
    FIEND: "Fiend",
    HAG: "Hag",
    LICH: "Lich",
    LYCANTHROPE: "Lycanthrope",
    OOZE: "Ooze",
    PRIMORDIAL: "Primordial",
    SERAPH: "Seraph",
    SHADOWSTEEL_GHOUL: "Shadowsteel Ghoul",
    SPECTER: "Specter",
    VAMPIRE: "Vampire"
});

export const ROLL_MODE = Object.freeze({
    ADVANTAGE: "adv",
    NORMAL: "nor",
    DISADVANTAGE: "dis"
})