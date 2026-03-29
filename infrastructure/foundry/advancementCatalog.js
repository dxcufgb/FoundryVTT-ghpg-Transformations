import { ABILITY, SKILL } from "../../config/constants.js"

const DAMAGE_TYPE_ICON_PATH =
          "modules/transformations/icons/damageTypes"
const SKILL_ICON_PATH =
          "modules/transformations/icons/skills"
const ABILITY_ICON_PATH =
          "modules/transformations/icons/abilities"

export const DAMAGE_TYPE_CHOICES = Object.freeze({
    acid: Object.freeze({
        id: "acid",
        label: "Acid",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Acid.png`
    }),
    bludgeoning: Object.freeze({
        id: "bludgeoning",
        label: "Bludgeoning",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Bludgeoning.png`
    }),
    cold: Object.freeze({
        id: "cold",
        label: "Cold",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Cold.png`
    }),
    fire: Object.freeze({
        id: "fire",
        label: "Fire",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Fire.png`
    }),
    force: Object.freeze({
        id: "force",
        label: "Force",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Force.png`
    }),
    lightning: Object.freeze({
        id: "lightning",
        label: "Lightning",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Lightning.png`
    }),
    necrotic: Object.freeze({
        id: "necrotic",
        label: "Necrotic",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Necrotic.png`
    }),
    piercing: Object.freeze({
        id: "piercing",
        label: "Piercing",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Piercing.png`
    }),
    poison: Object.freeze({
        id: "poison",
        label: "Poison",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Poison.png`
    }),
    psychic: Object.freeze({
        id: "psychic",
        label: "Psychic",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Psychic.png`
    }),
    radiant: Object.freeze({
        id: "radiant",
        label: "Radiant",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Radiant.png`
    }),
    slashing: Object.freeze({
        id: "slashing",
        label: "Slashing",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Slashing.png`
    }),
    thunder: Object.freeze({
        id: "thunder",
        label: "Thunder",
        icon: `${DAMAGE_TYPE_ICON_PATH}/Thunder.png`
    })
})

export const SKILL_CHOICES = Object.freeze({
    acr: Object.freeze({
        id: SKILL.ACROBATICS,
        label: "Acrobatics",
        icon: `${SKILL_ICON_PATH}/Acrobatics.png`
    }),
    ani: Object.freeze({
        id: SKILL.ANIMAL_HANDLING,
        label: "Animal Handling",
        icon: `${SKILL_ICON_PATH}/AnimalHandling.png`
    }),
    arc: Object.freeze({
        id: SKILL.ARCANA,
        label: "Arcana",
        icon: `${SKILL_ICON_PATH}/Arcana.png`
    }),
    ath: Object.freeze({
        id: SKILL.ATHLETICS,
        label: "Athletics",
        icon: `${SKILL_ICON_PATH}/Athletics.png`
    }),
    dec: Object.freeze({
        id: SKILL.DECEPTION,
        label: "Deception",
        icon: `${SKILL_ICON_PATH}/Deception.png`
    }),
    his: Object.freeze({
        id: SKILL.HISTORY,
        label: "History",
        icon: `${SKILL_ICON_PATH}/History.png`
    }),
    ins: Object.freeze({
        id: SKILL.INSIGHT,
        label: "Insight",
        icon: `${SKILL_ICON_PATH}/Insight.png`
    }),
    itm: Object.freeze({
        id: SKILL.INTIMIDATION,
        label: "Intimidation",
        icon: `${SKILL_ICON_PATH}/Intimidation.png`
    }),
    inv: Object.freeze({
        id: SKILL.INVESTIGATION,
        label: "Investigation",
        icon: `${SKILL_ICON_PATH}/Investigation.png`
    }),
    med: Object.freeze({
        id: SKILL.MEDICINE,
        label: "Medicine",
        icon: `${SKILL_ICON_PATH}/Medicine.png`
    }),
    nat: Object.freeze({
        id: SKILL.NATURE,
        label: "Nature",
        icon: `${SKILL_ICON_PATH}/Nature.png`
    }),
    prc: Object.freeze({
        id: SKILL.PERCEPTION,
        label: "Perception",
        icon: `${SKILL_ICON_PATH}/Perception.png`
    }),
    prf: Object.freeze({
        id: SKILL.PERFORMANCE,
        label: "Performance",
        icon: `${SKILL_ICON_PATH}/Performance.png`
    }),
    per: Object.freeze({
        id: SKILL.PERSUASION,
        label: "Persuasion",
        icon: `${SKILL_ICON_PATH}/Persuasion.png`
    }),
    rel: Object.freeze({
        id: SKILL.RELIGION,
        label: "Religion",
        icon: `${SKILL_ICON_PATH}/Religion.png`
    }),
    slt: Object.freeze({
        id: SKILL.SLEIGHT_OF_HAND,
        label: "Sleight of Hand",
        icon: `${SKILL_ICON_PATH}/SleightOfHand.png`
    }),
    ste: Object.freeze({
        id: SKILL.STEALTH,
        label: "Stealth",
        icon: `${SKILL_ICON_PATH}/Stealth.png`
    }),
    sur: Object.freeze({
        id: SKILL.SURVIVAL,
        label: "Survival",
        icon: `${SKILL_ICON_PATH}/Survival.png`
    })
})

export const SAVE_CHOICES = Object.freeze({
    str: Object.freeze({
        id: ABILITY.STRENGTH,
        label: "Strength",
        icon: `${ABILITY_ICON_PATH}/Strength.svg`
    }),
    dex: Object.freeze({
        id: ABILITY.DEXTERITY,
        label: "Dexterity",
        icon: `${ABILITY_ICON_PATH}/Dexterity.svg`
    }),
    con: Object.freeze({
        id: ABILITY.CONSTITUTION,
        label: "Constitution",
        icon: `${ABILITY_ICON_PATH}/Constitution.svg`
    }),
    int: Object.freeze({
        id: ABILITY.INTELLIGENCE,
        label: "Intelligence",
        icon: `${ABILITY_ICON_PATH}/Intelligence.svg`
    }),
    wis: Object.freeze({
        id: ABILITY.WISDOM,
        label: "Wisdom",
        icon: `${ABILITY_ICON_PATH}/Wisdom.svg`
    }),
    cha: Object.freeze({
        id: ABILITY.CHARISMA,
        label: "Charisma",
        icon: `${ABILITY_ICON_PATH}/Charisma.svg`
    })
})
