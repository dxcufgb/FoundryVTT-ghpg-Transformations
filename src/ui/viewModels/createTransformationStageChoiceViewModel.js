export function createTransformationStageChoiceViewModel({
    choices,
    selectedId = null
})
{
    return {
        choices: choices.map(c => ({
            ...c,
            checked: selectedId === c.id
        }))
    }
}