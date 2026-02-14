export function createTransformationPillViewModel({
    actor,
    transformation,
    editable,
    logger = null
})
{
    logger?.debug?.("createTransformationPillViewModel", {
        actor,
        transformation,
        editable
    })
    if (!transformation) {
        return {
            mode: "add",
            label: "None",
            editable,
            data: null
        }
    }

    return {
        mode: "stage",
        label: transformation.definition.name,
        editable,
        data: {
            itemId: transformation.itemId,
            uuid: transformation.definition.uuid,
            img: transformation.definition.img,
            stage: transformation.stage
        }
    }
}
