export function createHagSpellRecoveryController({
    resolve,
    logger
})
{
    logger?.debug?.("createHagSpellRecoveryController")

    let resolved = false

    async function confirm(selectedSpellSlot)
    {
        logger?.debug?.("HagSpellRecoveryController.confirm", {
            selectedSpellSlot
        })

        resolved = true
        resolve(selectedSpellSlot)
    }

    function cancel()
    {
        logger?.debug?.("HagSpellRecoveryController.cancel")

        if (!resolved) {
            resolve(null)
        }
    }

    return Object.freeze({
        confirm,
        cancel
    })
}
