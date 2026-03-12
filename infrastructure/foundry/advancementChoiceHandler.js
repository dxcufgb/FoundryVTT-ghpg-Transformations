const DAMAGE_RESISTANCE_ICON_PATH =
    "modules/transformations/icons/damageTypes"

const DAMAGE_RESISTANCE_CHOICES = Object.freeze({
    acid: Object.freeze({
        id: "acid",
        label: "Acid",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Acid.png`
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
    lightning: Object.freeze({
        id: "lightning",
        label: "Lightning",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Lightning.png`
    }),
    psychic: Object.freeze({
        id: "psychic",
        label: "Psychic",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Psychic.png`
    }),
    thunder: Object.freeze({
        id: "thunder",
        label: "Thunder",
        icon: `${DAMAGE_RESISTANCE_ICON_PATH}/Thunder.png`
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
        dr: createDamageResistanceChoices
    })

    async function choose({
        actor,
        advancementChoices = [],
        sourceItem = null,
        title = "Choose advancement",
        description = ""
    })
    {
        logger.debug("advancementChoiceHandler.choose", {
            actor,
            advancementChoices,
            sourceItem
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

        const choicePresentation = handler(parsedChoices)
        const resolvedChoices = choicePresentation?.choices ?? []

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

        return choicePresentation.applySelection({
            actor,
            sourceItem,
            selectedChoice
        })
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

            const [type, value] = rawChoice.split(":")

            if (!type || !value) {
                logger.warn(
                    "Skipping malformed advancement choice",
                    rawChoice
                )
                return []
            }

            return [{
                raw: rawChoice,
                type,
                value
            }]
        })
    }

    function createDamageResistanceChoices(parsedChoices = [])
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
                "Choose one damage resistance from the available options.",
            applySelection: ({ actor, sourceItem, selectedChoice }) =>
                applyDamageResistanceChoice({
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
        title,
        description
    })
    {
        logger.debug("advancementChoiceHandler.promptForChoice", {
            actor,
            choices,
            title,
            description
        })

        const selectedId =
            await dialogFactory.openTransformationGeneralChoiceDialog({
                actor,
                choices,
                description,
                title
            })

        if (!selectedId) {
            return null
        }

        const selectedChoice = choices.find(choice =>
            choice.id === selectedId
        )

        if (!selectedChoice) {
            logger.warn(
                "Advancement choice dialog returned unknown selection",
                selectedId
            )
            return null
        }

        return selectedChoice
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

        const effect = await activeEffectRepository.create({
            actor,
            name: `Damage Resistance: ${selectedChoice.label}`,
            description:
                `Gain resistance to ${selectedChoice.label.toLowerCase()} damage.`,
            source: "transformation",
            icon: selectedChoice.icon,
            origin: sourceItem?.uuid ?? actor?.uuid ?? "",
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
        })

        return effect != null
    }

    return Object.freeze({
        choose
    })
}
