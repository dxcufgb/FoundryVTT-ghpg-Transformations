export function createTransformationGeneralChoiceController({
    actor,
    resolve,
    logger
})
{
    logger?.debug?.("createTransformation-generalChoiceController", { actor })

    async function choose(choice)
    {
        logger?.debug?.("Transformation-generalChoiceController.choose", { choice })

        resolve(choice)
    }

    function cancel()
    {
        logger?.debug?.("Transformation-generalChoiceController.cancel")
        resolve(null)
    }

    return Object.freeze({
        choose,
        cancel
    })
}
