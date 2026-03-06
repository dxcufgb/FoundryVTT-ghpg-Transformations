export const D20Identifiers = {
    abilities: [
        "cha",
        "con",
        "dex",
        "int",
        "str",
        "wis"
    ],
    attributes: [
        "init",
        "concentration",
        "death"
    ],
    skills: [
        "acr",
        "ani",
        "arc",
        "ath",
        "dec",
        "his",
        "ins",
        "inv",
        "itm",
        "med",
        "nat",
        "per",
        "prc",
        "prf",
        "rel",
        "slt",
        "ste",
        "sur"
    ],
    Tools: [
        "flags.midi-qol.disadvantage.tool.all"
    ]
}
const abilityCheckKeys = D20Identifiers.abilities.map(ability =>
    `system.abilities.${ability}.check.roll.mode`
)

const abilitySaveKeys = D20Identifiers.abilities.map(ability =>
    `system.abilities.${ability}.save.roll.mode`
)

const attributeRollKeys = D20Identifiers.attributes.map(attribute =>
    `system.attributes.${attribute}.roll.mode`
)

const skillRollKeys = D20Identifiers.skills.map(skill =>
    `system.skills.${skill}.roll.mode`
)

const toolRollKeys = [...D20Identifiers.Tools]

export const D20RollKeys = [
    ...abilityCheckKeys,
    ...abilitySaveKeys,
    ...attributeRollKeys,
    ...skillRollKeys,
    ...toolRollKeys
]

export const disadvantageOnAllD20RollsEffectChanges = D20RollKeys.map(key =>
{
    const isToolKey = D20Identifiers.Tools.includes(key)

    return {
        "key": key,
        "value": isToolKey ? "1" : "-1",
        "mode": isToolKey ? 0 : 2
    }
})
