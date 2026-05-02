import {
    DAMAGE_TYPE_CHOICES,
    SAVE_CHOICES,
    SKILL_CHOICES
} from "./advancementCatalog.js"
import {
    createSkillChoiceDescription,
    createSkillChoiceName,
    resolveSkillChoiceValue
} from "./advancementSkillResolver.js"
import {
    createAbilityScoreAdvancementState,
    getAbilityScoreSelectionChanges,
    normalizeAbilityScoreSelection
} from "../../utils/abilityScoreAdvancement.js"
import {
    resolveDamageResistanceGrantType
} from "./advancementDamageResistance.js"

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
        saves: createSaveChoices,
        skills: createSkillChoices
    })

    async function choose({
        actor,
        advancementChoices = [],
        numberOfChoices = 1,
        sourceItem = null,
        title = "Choose advancement",
        description = "",
        apply = true,
        triggeringUserId = null
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

        let selectedChoice = null
        if (!globalThis.___TransformationTestEnvironment___?.choosenAdvancement?.find(a => a.name == sourceItem.name)) {
            selectedChoice = await promptForChoice({
                actor,
                dialogFactory,
                choices: resolvedChoices,
                choiceCount,
                description:
                    choicePresentation?.description ??
                    description,
                title:
                    choicePresentation?.title ??
                    title,
                triggeringUserId
            })
        } else {
            selectedChoice = globalThis.___TransformationTestEnvironment___.choosenAdvancement.find(a => a.name == sourceItem.name).choice
        }

        if (!selectedChoice) {
            return false
        }

        const selectedChoices = normalizeSelectedChoices(
            Array.isArray(selectedChoice)
                ? selectedChoice
                : [selectedChoice],
            resolvedChoices
        )

        if (!selectedChoices?.length) {
            logger.warn(
                "Advancement choice selection could not be resolved",
                {
                    sourceItem,
                    selectedChoice,
                    resolvedChoices: resolvedChoices.map(choice =>
                        choice?.raw ?? choice?.value ?? choice?.id ?? null
                    )
                }
            )
            return false
        }

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

    async function chooseAbilityScoreAdvancement({
        actor,
        advancementConfiguration = {},
        sourceItem = null,
        title = "Allocate Ability Scores",
        apply = true,
        triggeringUserId = null
    })
    {
        logger.debug("advancementChoiceHandler.chooseAbilityScoreAdvancement", {
            actor,
            advancementConfiguration,
            sourceItem,
            title,
            apply,
            triggeringUserId
        })

        if (!actor) {
            return null
        }

        const abilityState = createAbilityScoreAdvancementState({
            actor,
            advancementConfiguration
        })
        const requiresAbilityScoreDialog =
            abilityState.abilities.some(ability => !ability.locked)
        const dialogFactory = requiresAbilityScoreDialog
            ? getDialogFactory?.()
            : null

        if (
            requiresAbilityScoreDialog &&
            !dialogFactory?.openAbilityScoreAdvancementDialog
        ) {
            logger.warn(
                "Ability score advancement skipped: dialog factory not available",
                advancementConfiguration
            )
            return null
        }

        const selectedValues = await resolveAbilityScoreAdvancementSelection({
            actor,
            dialogFactory,
            abilityState,
            sourceItem,
            title,
            triggeringUserId
        })

        if (selectedValues == null) {
            return false
        }

        const normalizedSelection = normalizeAbilityScoreSelection(
            selectedValues,
            abilityState.abilities,
            abilityState.advancementConfiguration.points
        )
        const effectData = buildAbilityScoreAdvancementEffectData({
            actor,
            sourceItem,
            abilityStates: abilityState.abilities,
            selection: normalizedSelection
        })

        if (!apply) {
            return effectData ? [effectData] : []
        }

        if (!effectData) {
            return true
        }

        const effect = await activeEffectRepository.create(effectData)

        return effect != null
    }

    async function chooseItemPool({
        actor,
        itemChoices = [],
        numberOfChoices = 1,
        sourceItem = null,
        triggeringUserId = null
    })
    {
        logger.debug("advancementChoiceHandler.chooseItemPool", {
            actor,
            itemChoices,
            numberOfChoices,
            sourceItem
        })

        if (!Array.isArray(itemChoices) || !itemChoices.length) {
            return null
        }

        const choiceCount = Math.min(
            Math.max(Number(numberOfChoices) || 1, 1),
            itemChoices.length
        )

        if (choiceCount !== 1) {
            logger.warn(
                "Advancement item choice pool currently supports single selection only",
                itemChoices
            )
            return null
        }

        const dialogFactory = getDialogFactory?.()
        if (!dialogFactory?.openStageChoiceDialog) {
            logger.warn(
                "Advancement item choice skipped: choice dialog not available",
                itemChoices
            )
            return null
        }

        const testChoice = globalThis.___TransformationTestEnvironment___
            ?.choosenAdvancement
            ?.find(choice => choice.name === sourceItem?.name)

        const selectedUuid = testChoice
            ? normalizeSelectedItemUuid(testChoice.choice)
            : await promptForItemPoolChoice({
                actor,
                dialogFactory,
                choices: itemChoices,
                sourceItem,
                triggeringUserId
            })

        if (!selectedUuid) {
            return false
        }

        const selectedChoice = itemChoices.find(choice =>
            choice.uuid === selectedUuid
        )

        if (!selectedChoice) {
            logger.warn(
                "Advancement item choice dialog returned unknown selection",
                selectedUuid
            )
            return null
        }

        return selectedChoice
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
            case "saves":
                return Object.keys(SAVE_CHOICES)
            case "dr":
                return Object.keys(DAMAGE_TYPE_CHOICES)
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
            const entry = DAMAGE_TYPE_CHOICES[choice.value]

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

    function createSaveChoices(parsedChoices = [], choicesCount)
    {
        logger.debug("advancementChoiceHandler.createSaveChoices", {
            parsedChoices
        })

        const choices = parsedChoices.flatMap(choice =>
        {
            const entry = SAVE_CHOICES[choice.value]

            if (!entry) {
                logger.warn(
                    "Unknown save advancement choice",
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
            title: "Choose saving throw proficiency",
            description:
                `Choose ${choicesCount} saving throw proficiency from the available options.`,
            getSelection: ({actor, sourceItem, selectedChoice}) =>
                buildSaveChoiceEffectData({
                    actor,
                    sourceItem,
                    selectedChoice
                }) ?? [],
            getSelectionChanges: ({actor, sourceItem, selectedChoice}) =>
                buildSaveChoiceEffectData({
                    actor,
                    sourceItem,
                    selectedChoice
                })?.changes ?? [],
            applySelection: ({actor, sourceItem, selectedChoice}) =>
                applySaveChoice({
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
        description,
        triggeringUserId = null
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
            title,
            triggeringUserId
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

    async function promptForItemPoolChoice({
        actor,
        dialogFactory,
        choices,
        sourceItem,
        triggeringUserId = null
    })
    {
        logger.debug("advancementChoiceHandler.promptForItemPoolChoice", {
            actor,
            choices,
            sourceItem
        })

        return dialogFactory.openStageChoiceDialog({
            actor,
            choices,
            stage:
                `advancement-${sourceItem?.id ?? sourceItem?.uuid ?? sourceItem?.name ?? actor?.id ?? "item"}`,
            triggeringUserId
        })
    }

    function normalizeSelectedItemUuid(choice)
    {
        if (typeof choice === "string")
            return choice

        return choice?.uuid ?? choice?.id ?? null
    }

    function normalizeSelectedChoices(selectedChoices = [], availableChoices = [])
    {
        return selectedChoices
            .map(choice => normalizeSelectedChoice(choice, availableChoices))
            .filter(Boolean)
    }

    function normalizeSelectedChoice(choice, availableChoices = [])
    {
        if (!choice)
            return null

        if (typeof choice === "object") {
            const normalizedIdentifier =
                choice.id ??
                choice.value ??
                choice.raw ??
                null

            if (!normalizedIdentifier)
                return null

            return availableChoices.find(availableChoice =>
                availableChoice?.id === normalizedIdentifier ||
                availableChoice?.value === normalizedIdentifier ||
                availableChoice?.raw === normalizedIdentifier
            ) ?? null
        }

        if (typeof choice === "string") {
            return availableChoices.find(availableChoice =>
                availableChoice?.id === choice ||
                availableChoice?.value === choice ||
                availableChoice?.raw === choice
            ) ?? null
        }

        return null
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

        if (!effectData) return false

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
            mode,
            logger
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

    async function applySaveChoice({
        actor,
        sourceItem,
        selectedChoice
    })
    {
        logger.debug("advancementChoiceHandler.applySaveChoice", {
            actor,
            sourceItem,
            selectedChoice
        })

        const effectData = buildSaveChoiceEffectData({
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
        if (!selectedChoice?.label || !selectedChoice?.value || !selectedChoice?.raw) {
            logger.warn(
                "Damage resistance advancement selection is missing required metadata",
                {
                    actor,
                    sourceItem,
                    selectedChoice
                }
            )
            return null
        }

        const grantType = resolveDamageResistanceGrantType({
            actor,
            sourceItem,
            damageType: selectedChoice.value
        })
        const grantsImmunity = grantType === "immunity"

        return {
            actor,
            name: `${grantsImmunity ? "Damage Immunity" : "Damage Resistance"}: ${selectedChoice.label}`,
            label: selectedChoice.label,
            description:
                `Gain ${grantsImmunity ? "immunity" : "resistance"} to ${selectedChoice.label.toLowerCase()} damage.`,
            source: "transformation",
            icon: selectedChoice.icon,
            origin: sourceItem?.uuid ?? actor?.uuid ?? "",
            resistanceIdentifier: selectedChoice.value,
            changes: [{
                key: grantsImmunity
                    ? "system.traits.di.value"
                    : "system.traits.dr.value",
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
            mode,
            logger
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

    function buildSaveChoiceEffectData({
        actor,
        sourceItem,
        selectedChoice
    })
    {
        if (!selectedChoice?.label || !selectedChoice?.value || !selectedChoice?.raw) {
            logger.warn(
                "Saving throw advancement selection is missing required metadata",
                {
                    actor,
                    sourceItem,
                    selectedChoice
                }
            )
            return null
        }

        return {
            actor,
            name: `Saving Throw Proficiency: ${selectedChoice.label}`,
            label: selectedChoice.label,
            description:
                `Gain proficiency in ${selectedChoice.label.toLowerCase()} saving throws.`,
            source: "transformation",
            icon: selectedChoice.icon,
            origin: sourceItem?.uuid ?? actor?.uuid ?? "",
            saveIdentifier: selectedChoice.value,
            changes: [{
                key: `system.abilities.${selectedChoice.value}.proficient`,
                mode: globalThis.CONST?.ACTIVE_EFFECT_MODES?.UPGRADE ?? 4,
                value: 1
            }],
            flags: {
                dnd5e: {
                    hidden: true
                },
                transformations: {
                    advancementChoice: selectedChoice.raw,
                    advancementChoiceType: "save"
                }
            }
        }
    }

    return Object.freeze({
        choose,
        chooseAbilityScoreAdvancement,
        chooseItemPool
    })

    async function resolveAbilityScoreAdvancementSelection({
        actor,
        dialogFactory,
        abilityState,
        sourceItem,
        title,
        triggeringUserId = null
    })
    {
        const testChoice = globalThis.___TransformationTestEnvironment___
            ?.choosenAdvancement
            ?.find(choice => choice.name === sourceItem?.name)

        if (allAbilityScoreAdvancementAbilitiesLocked(abilityState)) {
            return buildLockedAbilityScoreSelection(abilityState)
        }

        if (testChoice) {
            return normalizeAbilityScoreSelectionInput(testChoice.choice)
        }

        return dialogFactory.openAbilityScoreAdvancementDialog({
            actor,
            advancementConfiguration: abilityState.advancementConfiguration,
            title,
            triggeringUserId
        })
    }

    function normalizeAbilityScoreSelectionInput(selection)
    {
        if (!selection || typeof selection !== "object") {
            return {}
        }

        if (
            selection.selectedValues &&
            typeof selection.selectedValues === "object"
        ) {
            return selection.selectedValues
        }

        return selection
    }

    function allAbilityScoreAdvancementAbilitiesLocked(abilityState)
    {
        const abilities = abilityState?.abilities ?? []

        return abilities.length > 0 &&
            abilities.every(ability => ability?.locked === true)
    }

    function buildLockedAbilityScoreSelection(abilityState)
    {
        return (abilityState?.abilities ?? []).reduce((selection, ability) =>
        {
            if (!ability?.key) {
                return selection
            }

            selection[ability.key] = ability.minimumValue
            return selection
        }, {})
    }

    function buildAbilityScoreAdvancementEffectData({
        actor,
        sourceItem,
        abilityStates = [],
        selection = {}
    })
    {
        const selectedChanges = getAbilityScoreSelectionChanges(
            selection,
            abilityStates
        )

        if (!selectedChanges.length) {
            return null
        }

        const labels = selectedChanges.map(change => change.label)
        const summary = selectedChanges.map(change =>
            `${change.label} ${change.selectedValue}`
        ).join(", ")

        return {
            actor,
            name: `Ability Score Increase: ${labels.join(", ")}`,
            description: `Set ability scores to ${summary}.`,
            source: "transformation",
            icon: sourceItem?.img ?? selectedChanges[0]?.icon ?? null,
            origin: sourceItem?.uuid ?? actor?.uuid ?? "",
            changes: selectedChanges.map(change => ({
                key: `system.abilities.${change.key}.value`,
                mode: globalThis.CONST?.ACTIVE_EFFECT_MODES?.UPGRADE ?? 4,
                value: change.selectedValue
            })),
            flags: {
                dnd5e: {
                    hidden: true
                },
                transformations: {
                    advancementChoiceType: "abilityScore",
                    advancementChoiceSelection:
                        selectedChanges.reduce((mappedSelection, change) =>
                        {
                            mappedSelection[change.key] = change.selectedValue
                            return mappedSelection
                        }, {})
                }
            }
        }
    }
}
