export function createTransformationGeneralChoiceViewModel({
    choices,
    selectedId = null,
    choiceCount = 1,
    description = "",
    title = "Make a choice",
    logger = null
})
{
    logger?.debug?.("createTransformationGeneralChoiceViewModel", {
        choices,
        selectedId,
        choiceCount,
        description,
        title
    })

    const normalizedChoiceCount = Math.max(Number(choiceCount) || 1, 1)

    return {
        choices: choices.map(type => ({
            id: type.id,
            icon: type.icon,
            label: type.label
        })),
        choiceCount: normalizedChoiceCount,
        isMultiChoice: normalizedChoiceCount > 1,
        choicesLeft: normalizedChoiceCount,
        description,
        title
    }
}
