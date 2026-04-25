import {
    normalizeTransformationStageChoiceCount,
    normalizeTransformationStageChoiceSelection
} from "../../utils/transformationStageChoiceSelection.js"

export function createTransformationStageChoiceViewModel({
    choices,
    selectedIds = [],
    selectedId = null,
    choiceCount = 1,
    logger = null
})
{
    const normalizedChoiceCount =
              normalizeTransformationStageChoiceCount(choiceCount)
    const normalizedSelectedIds =
              normalizeTransformationStageChoiceSelection(
                  selectedId ?? selectedIds,
                  normalizedChoiceCount
              )

    logger?.debug?.("createTransformationStageChoiceViewModel", {
        choices,
        selectedIds: normalizedSelectedIds,
        choiceCount: normalizedChoiceCount
    })

    return {
        choices: choices.map(c => ({
            id: c.id ?? c.uuid,
            ...c,
            checked: normalizedSelectedIds.includes(c.uuid)
        })),
        choiceCount: normalizedChoiceCount,
        isMultiChoice: normalizedChoiceCount > 1,
        choicesLeft: Math.max(
            normalizedChoiceCount - normalizedSelectedIds.length,
            0
        ),
        selectionInputType:
            normalizedChoiceCount > 1
                ? "checkbox"
                : "radio"
    }
}
