export function createAbilityScoreAdvancementController({
    resolve,
    logger
})
{
    logger?.debug?.("createAbilityScoreAdvancementController")

    let resolved = false

    async function confirm(selection)
    {
        logger?.debug?.("AbilityScoreAdvancementController.confirm", {
            selection
        })

        resolved = true
        resolve(selection)
    }

    function cancel()
    {
        logger?.debug?.("AbilityScoreAdvancementController.cancel")

        if (!resolved) {
            resolve(null)
        }
    }

    return Object.freeze({
        confirm,
        cancel
    })
}
