export function normalizeTransformationStageChoiceCount(choiceCount = 1)
{
    const numericChoiceCount = Number(choiceCount)

    if (!Number.isFinite(numericChoiceCount)) {
        return 1
    }

    return Math.max(Math.trunc(numericChoiceCount), 1)
}

export function normalizeTransformationStageChoiceSelection(
    selection,
    choiceCount = 1
)
{
    const normalizedChoiceCount =
              normalizeTransformationStageChoiceCount(choiceCount)
    const rawSelections = Array.isArray(selection)
        ? selection
        : selection == null
            ? []
            : [selection]

    return Array.from(new Set(
        rawSelections.filter(value =>
            typeof value === "string" && value.length > 0
        )
    )).slice(0, normalizedChoiceCount)
}

export function serializeTransformationStageChoiceSelection(
    selection,
    choiceCount = 1
)
{
    const normalizedChoiceCount =
              normalizeTransformationStageChoiceCount(choiceCount)
    const normalizedSelection =
              normalizeTransformationStageChoiceSelection(
                  selection,
                  normalizedChoiceCount
              )

    return normalizedChoiceCount === 1
        ? normalizedSelection[0] ?? null
        : normalizedSelection
}

export function hasCompleteTransformationStageChoiceSelection(
    selection,
    choiceCount = 1
)
{
    return normalizeTransformationStageChoiceSelection(
        selection,
        choiceCount
    ).length === normalizeTransformationStageChoiceCount(choiceCount)
}
