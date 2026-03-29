export function resolveSkillChoiceValue({
    currentValue,
    mode,
    logger = null
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
            logger?.warn?.(
                "Unknown skill advancement mode",
                mode
            )
            return null
    }
}

export function createSkillChoiceName(label, mode, resolvedSkillValue)
{
    if (mode === "upgrade" && resolvedSkillValue === 1) {
        return `Skill Proficiency: ${label}`
    }

    return `Skill Expertise: ${label}`
}

export function createSkillChoiceDescription(label, mode, resolvedSkillValue)
{
    if (mode === "upgrade" && resolvedSkillValue === 1) {
        return `Gain proficiency in ${label}.`
    }

    if (mode === "expertise") {
        return `Gain expertise in ${label} if you are already proficient.`
    }

    return `Gain expertise in ${label}.`
}
