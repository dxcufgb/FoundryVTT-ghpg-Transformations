export function createTransformationStageChoiceViewModel({
    choices,
    selectedId = null,
    logger = null
})
{
    logger?.debug?.("createTransformationStageChoiceViewModel", {
        choices,
        selectedId
    })
    return {
        choices: choices.map(c => ({
            ...c,
            checked: selectedId === c.id
        }))
    }
}
