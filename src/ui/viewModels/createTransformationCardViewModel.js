export function createTransformationCardViewModel(actor, transformationTypes, isGM, editMode = false, logger = null)
{
    logger?.debug?.("createTransformationCardViewModel", {
        actor,
        transformationTypes,
        isGM,
        editMode
    })
    const flags = actor.flags.transformations ?? {}

    const transformationType = flags.type ?? ""
    const transformationStage = flags.stage ?? 0

    const editable = isGM && editMode

    // ðŸ”¹ Load available subclasses (same logic as config dialog)
    const subclasses = Object.entries(transformationTypes).map(([id, label]) => ({
        id,
        label,
        selected: id === transformationType
    }))

    // Fallback option
    subclasses.unshift({
        id: "",
        label: "None",
        selected: transformationType === ""
    })

    const stages = [
        { value: 0, label: "Dormant" },
        { value: 1, label: "Stage 1" },
        { value: 2, label: "Stage 2" },
        { value: 3, label: "Stage 3" },
        { value: 4, label: "Stage 4" }
    ].map(s => ({
        ...s,
        selected: s.value === transformationStage
    }))

    return {
        editable,
        types: subclasses,
        stages,
        selectedTypeLabel:
            subclasses.find(t => t.selected)?.label ?? "None",
        selectedStageLabel:
            stages.find(s => s.selected)?.label ?? "Dormant"
    }
}
