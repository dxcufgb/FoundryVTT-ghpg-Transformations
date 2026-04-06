export function createTransformationsSpellSlotRecoveryController({
    resolve,
    logger
})
{
    logger?.debug?.("createTransformationsSpellSlotRecoveryController")

    let resolved = false

    async function confirm(selection)
    {
        logger?.debug?.("TransformationsSpellSlotRecoveryController.confirm", {
            selection
        })

        resolved = true
        resolve(selection)
    }

    function cancel()
    {
        logger?.debug?.("TransformationsSpellSlotRecoveryController.cancel")

        if (!resolved) {
            resolve(null)
        }
    }

    return Object.freeze({
        confirm,
        cancel
    })
}
