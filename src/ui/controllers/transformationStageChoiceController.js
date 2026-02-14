export function createTransformationStageChoiceController({
    actor,
    resolve,
    logger
})
{
    let settled = false

    function choose(choiceId)
    {
        if (settled) return
        settled = true

        logger.debug("Stage choice selected", actor.id, choiceId)
        resolve(choiceId)
    }

    function cancel()
    {
        if (settled) return
        settled = true

        logger.debug("Stage choice cancelled", actor.id)
        resolve(undefined)
    }

    return Object.freeze({
        choose,
        cancel
    })
}
