export function createFiendUnbridledPowerSpellSlotRecoveryController({
    resolve,
    logger
})
{
    logger?.debug?.("createFiendUnbridledPowerSpellSlotRecoveryController")

    let resolved = false

    async function confirm(selectedSpellSlots)
    {
        logger?.debug?.(
            "FiendUnbridledPowerSpellSlotRecoveryController.confirm",
            {selectedSpellSlots}
        )

        resolved = true
        resolve(selectedSpellSlots)
    }

    function cancel()
    {
        logger?.debug?.("FiendUnbridledPowerSpellSlotRecoveryController.cancel")

        if (!resolved) {
            resolve(null)
        }
    }

    return Object.freeze({
        confirm,
        cancel
    })
}
