export function createTransformationGeneralChoiceViewModel({
    choices,
    selectedId = null,
    description = "",
    title = "Make a choice",
    logger = null
})
{
    logger?.debug?.("createTransformationGeneralChoiceViewModel", {
        choices,
        selectedId,
        description,
        title
    })

    return {
        choices: choices.map(type => ({
            id: type.id,
            icon: type.icon,
            label: type.label
        })),
        description,
        title
    }
}
