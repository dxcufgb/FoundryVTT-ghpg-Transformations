export function createTransformationStageChoiceController({
    actor,
    resolve,
    logger
})
{
    logger?.debug?.("createTransformationStageChoiceController", {
        actor,
        resolve
    })
    let settled = false

    function choose(choiceId)
    {
        logger?.debug?.("createTransformationStageChoiceController.choose", {
            choiceId
        })
        if (settled) return
        settled = true

        logger?.debug?.("Stage choice selected", actor?.id, choiceId)
        resolve(choiceId)
    }

    function cancel()
    {
        logger?.debug?.("createTransformationStageChoiceController.cancel", {})
        if (settled) return
        settled = true

        logger?.debug?.("Stage choice cancelled", actor?.id)
        resolve(undefined)
    }

    return Object.freeze({
        choose,
        cancel
    })
}
