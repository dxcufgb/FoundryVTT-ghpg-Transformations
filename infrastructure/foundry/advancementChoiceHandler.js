import { SKILL } from "../../config/constants.js"

const DAMAGE_RESISTANCE_ICON_PATH =
          "modules/transformations/icons/damageTypes"
const SKILL_ICON_PATH =
          "modules/transformations/icons/skills"

const DAMAGE_RESISTANCE_CHOICES = Object.freeze({
    acid: Object.freeze({
        id: "acid",
        label: "Acid",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Acid.png`
    }),
    bludgeoning: Object.freeze({
        id: "bludgeoning",
        label: "Bludgeoning",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Bludgeoning.png`
    }),
    cold: Object.freeze({
        id: "cold",
        label: "Cold",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Cold.png`
    }),
    fire: Object.freeze({
        id: "fire",
        label: "Fire",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Fire.png`
    }),
    force: Object.freeze({
        id: "force",
        label: "Force",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Force.png`
    }),
    lightning: Object.freeze({
        id: "lightning",
        label: "Lightning",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Lightning.png`
    }),
    necrotic: Object.freeze({
        id: "necrotic",
        label: "Necrotic",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Necrotic.png`
    }),
    piercing: Object.freeze({
        id: "piercing",
        label: "Piercing",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Piercing.png`
    }),
    poison: Object.freeze({
        id: "poison",
        label: "Poison",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Poison.png`
    }),
    psychic: Object.freeze({
        id: "psychic",
        label: "Psychic",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Psychic.png`
    }),
    radiant: Object.freeze({
        id: "radiant",
        label: "Radiant",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Radiant.png`
    }),
    slashing: Object.freeze({
        id: "slashing",
        label: "Slashing",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Slashing.png`
    }),
    thunder: Object.freeze({
        id: "thunder",
        label: "Thunder",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Thunder.png`
    })
})

const SKILL_CHOICES = Object.freeze({
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

export function createAdvancementChoiceHandler({
    activeEffectRepository,
    getDialogFactory,
    logger
})
{
    logger.debug("createAdvancementChoiceHandler", {
        getDialogFactory
    })

    const handlers = Object.freeze({
        dr: createDamageResistanceChoices,
        skills: createSkillChoices
    })

    async function choose({
        actor,
        advancementChoices = [],
        numberOfChoices = 1,
        sourceItem = null,
        title = "Choose advancement",
        description = "",
        apply = true
    })
    {
        logger.debug("advancementChoiceHandler.choose", {
            actor,
            advancementChoices,
            numberOfChoices,
            sourceItem,
            apply
        })

        if (!Array.isArray(advancementChoices) || !advancementChoices.length) {
            return null
        }

        const parsedChoices = parseChoices(advancementChoices)
        if (!parsedChoices.length) {
            return null
        }

        const choiceType = parsedChoices[0].type
        const supportsSingleType = parsedChoices.every(choice =>
            choice.type === choiceType
        )

        if (!supportsSingleType) {
            logger.warn(
                "Advancement choice pool contains mixed choice types",
                advancementChoices
            )
            return null
        }

        const handler = handlers[choiceType]
        if (!handler) {
            logger.warn(
                "No advancement choice handler registered",
                choiceType
            )
            return null
        }

        const choicePresentation = handler(parsedChoices, numberOfChoices)
        const resolvedChoices = choicePresentation?.choices ?? []
        const choiceCount = Math.min(
            Math.max(Number(numberOfChoices) || 1, 1),
            resolvedChoices.length
        )

        if (!resolvedChoices.length) {
            return null
        }

        const dialogFactory = getDialogFactory?.()
        if (!dialogFactory) {
            logger.warn(
                "Advancement choice skipped: dialog factory not available",
                advancementChoices
            )
            return null
        }

        const selectedChoice = await promptForChoice({
            actor,
            dialogFactory,
            choices: resolvedChoices,
            choiceCount,
            description:
                choicePresentation?.description ??
                description,
            title:
                choicePresentation?.title ??
                title
        })

        if (!selectedChoice) {
            return false
        }

        const selectedChoices = Array.isArray(selectedChoice)
            ? selectedChoice
            : [selectedChoice]

        if (!apply) {
            const selections = []

            for (const choice of selectedChoices) {
                const selectionChanges = choicePresentation.getSelection?.({
                    actor,
                    sourceItem,
                    selectedChoice: choice
                }) ?? []

                if (!typeof selectionChanges === "Object") {
                    logger.warn(
                        "Advancement choice returned non-Object changes payload",
                        selectionChanges
                    )
                    return []
                }

                selections.push(selectionChanges)
            }

            return selections
        }

        const results = []
        for (const choice of selectedChoices) {
            results.push(
                await choicePresentation.applySelection({
                    actor,
                    sourceItem,
                    selectedChoice: choice
                })
            )
        }

        return results.every(Boolean)
    }

    function parseChoices(advancementChoices = [])
    {
        logger.debug("advancementChoiceHandler.parseChoices", {
            advancementChoices
        })

        return advancementChoices.flatMap(rawChoice =>
        {
            if (typeof rawChoice !== "string") {
                logger.warn(
                    "Skipping advancement choice with invalid type",
                    rawChoice
                )
                return []
            }

            const [type, value, mode = null] = rawChoice.split(":")

            if (!type || !value) {
                logger.warn(
                    "Skipping malformed advancement choice",
                    rawChoice
                )
                return []
            }

            if (value === "*") {
                const wildcardValues = getWildcardChoiceValues(type)

                if (!wildcardValues.length) {
                    logger.warn(
                        "Skipping wildcard advancement choice with no registered values",
                        rawChoice
                    )
                    return []
                }

                return wildcardValues.map(expandedValue => ({
                    raw: [type, expandedValue, mode].filter(Boolean).join(":"),
                    type,
                    value: expandedValue,
                    mode
                }))
            }

            return [{
                raw: [type, value, mode].filter(Boolean).join(":"),
                type,
                value,
                mode
            }]
        })
    }

    function getWildcardChoiceValues(type)
    {
        switch (type) {
            case "skills":
                return Object.keys(SKILL_CHOICES)
            case "dr":
                return Object.keys(DAMAGE_RESISTANCE_CHOICES)
            default:
                return []
        }
    }

    function createDamageResistanceChoices(parsedChoices = [], choicesCount)
    {
        logger.debug("advancementChoiceHandler.createDamageResistanceChoices", {
            parsedChoices
        })

        const choices = parsedChoices.flatMap(choice =>
        {
            const entry = DAMAGE_RESISTANCE_CHOICES[choice.value]

            if (!entry) {
                logger.warn(
                    "Unknown damage resistance advancement choice",
                    choice.value
                )
                return []
            }

            return [{
                ...entry,
                raw: choice.raw,
                value: choice.value
            }]
        })

        return {
            choices,
            title: "Choose damage resistance",
            description:
                `Choose ${choicesCount} damage resistance from the available options.`,
            getSelection: ({actor, sourceItem, selectedChoice}) =>
                buildDamageResistanceChoiceEffectData({
                    actor,
                    sourceItem,
                    selectedChoice
                }) ?? [],
            getSelectionChanges: ({actor, sourceItem, selectedChoice}) =>
                buildDamageResistanceChoiceEffectData({
                    actor,
                    sourceItem,
                    selectedChoice
                })?.changes ?? [],
            applySelection: ({actor, sourceItem, selectedChoice}) =>
                applyDamageResistanceChoice({
                    actor,
                    sourceItem,
                    selectedChoice
                })
        }
    }

    function createSkillChoices(parsedChoices = [], choicesCount)
    {
        logger.debug("advancementChoiceHandler.createSkillChoices", {
            parsedChoices
        })

        const choices = parsedChoices.flatMap(choice =>
        {
            const entry = SKILL_CHOICES[choice.value]

            if (!entry) {
                logger.warn(
                    "Unknown skill advancement choice",
                    choice.value
                )
                return []
            }

            return [{
                ...entry,
                raw: choice.raw,
                value: choice.value,
                mode: choice.mode ?? "forcedExpertise"
            }]
        })

        return {
            choices,
            title: "Choose skill",
            description:
                `Choose ${choicesCount} skill from the available options.`,
            getSelection: ({actor, sourceItem, selectedChoice}) =>
                buildSkillChoiceEffectData({
                    actor,
                    sourceItem,
                    selectedChoice
                }) ?? [],
            getSelectionChanges: ({actor, sourceItem, selectedChoice}) =>
                buildSkillChoiceEffectData({
                    actor,
                    sourceItem,
                    selectedChoice
                })?.changes ?? [],
            applySelection: ({actor, sourceItem, selectedChoice}) =>
                applySkillChoice({
                    actor,
                    sourceItem,
                    selectedChoice
                })
        }
    }

    async function promptForChoice({
        actor,
        dialogFactory,
        choices,
        choiceCount = 1,
        title,
        description
    })
    {
        logger.debug("advancementChoiceHandler.promptForChoice", {
            actor,
            choices,
            choiceCount,
            title,
            description
        })

        const selectedIds = await dialogFactory.openTransformationGeneralChoiceDialog({
            actor,
            choices,
            choiceCount,
            description,
            title
        })

        if (!selectedIds) {
            return null
        }

        const normalizedIds = Array.isArray(selectedIds)
            ? selectedIds
            : [selectedIds]

        const selectedChoices = normalizedIds.map(selectedId =>
            choices.find(choice => choice.id === selectedId)
        )

        if (selectedChoices.some(choice => !choice)) {
            logger.warn(
                "Advancement choice dialog returned unknown selection",
                selectedIds
            )
            return null
        }

        return choiceCount === 1
            ? selectedChoices[0]
            : selectedChoices
    }

    async function applyDamageResistanceChoice({
        actor,
        sourceItem,
        selectedChoice
    })
    {
        logger.debug("advancementChoiceHandler.applyDamageResistanceChoice", {
            actor,
            sourceItem,
            selectedChoice
        })

        const effectData = buildDamageResistanceChoiceEffectData({
            actor,
            sourceItem,
            selectedChoice
        })

        const effect = await activeEffectRepository.create(effectData)

        return effect != null
    }

    async function applySkillChoice({
        actor,
        sourceItem,
        selectedChoice
    })
    {
        logger.debug("advancementChoiceHandler.applySkillChoice", {
            actor,
            sourceItem,
            selectedChoice
        })

        const skillValue = Number(actor?.system?.skills?.[selectedChoice.value]?.value ?? 0)
        const mode = selectedChoice.mode ?? "forcedExpertise"
        const resolvedSkillValue = resolveSkillChoiceValue({
            currentValue: skillValue,
            mode
        })

        if (resolvedSkillValue == null) {
            logger.debug("advancementChoiceHandler.applySkillChoice.skipped", {
                actor,
                selectedChoice,
                skillValue,
                mode
            })
            return false
        }

        const effectData = buildSkillChoiceEffectData({
            actor,
            sourceItem,
            selectedChoice
        })

        if (!effectData) return false

        const effect = await activeEffectRepository.create(effectData)

        return effect != null
    }

    function buildDamageResistanceChoiceEffectData({
        actor,
        sourceItem,
        selectedChoice
    })
    {
        return {
            actor,
            name: `Damage Resistance: ${selectedChoice.label}`,
            label: selectedChoice.label,
            description:
                `Gain resistance to ${selectedChoice.label.toLowerCase()} damage.`,
            source: "transformation",
            icon: selectedChoice.icon,
            origin: sourceItem?.uuid ?? actor?.uuid ?? "",
            resistanceIdentifier: selectedChoice.value,
            changes: [{
                key: "system.traits.dr.value",
                mode: globalThis.CONST?.ACTIVE_EFFECT_MODES?.ADD ?? 2,
                value: selectedChoice.value
            }],
            flags: {
                dnd5e: {
                    hidden: true
                },
                transformations: {
                    advancementChoice: selectedChoice.raw,
                    advancementChoiceType: "damageResistance"
                }
            }
        }
    }

    function buildSkillChoiceEffectData({
        actor,
        sourceItem,
        selectedChoice
    })
    {
        const skillValue = Number(actor?.system?.skills?.[selectedChoice.value]?.value ?? 0)
        const mode = selectedChoice.mode ?? "forcedExpertise"
        const resolvedSkillValue = resolveSkillChoiceValue({
            currentValue: skillValue,
            mode
        })

        if (resolvedSkillValue == null) {
            return null
        }

        return {
            actor,
            name: createSkillChoiceName(selectedChoice.label, mode, resolvedSkillValue),
            label: selectedChoice.label,
            description: createSkillChoiceDescription(selectedChoice.label, mode, resolvedSkillValue),
            source: "transformation",
            icon: selectedChoice.icon,
            origin: sourceItem?.uuid ?? actor?.uuid ?? "",
            skillIdentifier: selectedChoice.value,
            changes: [{
                key: `system.skills.${selectedChoice.value}.value`,
                mode: globalThis.CONST?.ACTIVE_EFFECT_MODES?.UPGRADE ?? 4,
                value: resolvedSkillValue
            }],
            flags: {
                dnd5e: {
                    hidden: true
                },
                transformations: {
                    advancementChoice: selectedChoice.raw,
                    advancementChoiceType: "skill",
                    advancementChoiceMode: mode
                }
            }
        }
    }

    function resolveSkillChoiceValue({
        currentValue,
        mode
    })
    {
        switch (mode) {
            case "expertise":
                return currentValue >= 1 ? 2 : null
            case "forcedExpertise":
                return 2
            case "upgrade":
                return currentValue >= 1 ? 2 : 1
            default:
                logger.warn(
                    "Unknown skill advancement mode",
                    mode
                )
                return null
        }
    }

    function createSkillChoiceName(label, mode, resolvedSkillValue)
    {
        if (mode === "upgrade" && resolvedSkillValue === 1) {
            return `Skill Proficiency: ${label}`
        }

        return `Skill Expertise: ${label}`
    }

    function createSkillChoiceDescription(label, mode, resolvedSkillValue)
    {
        if (mode === "upgrade" && resolvedSkillValue === 1) {
            return `Gain proficiency in ${label}.`
        }

        if (mode === "expertise") {
            return `Gain expertise in ${label} if you are already proficient.`
        }

        return `Gain expertise in ${label}.`
    }

    return Object.freeze({
        choose
    })
}
