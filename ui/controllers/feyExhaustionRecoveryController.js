// fey-exhaustion-recovery-controller.js
export function createFeyExhaustionRecoveryController({
    resolve,
    logger
})
{
    logger?.debug?.("createFeyExhaustionRecoveryController")

    let resolved = false

    async function confirm(amount)
    {
        logger?.debug?.("FeyExhaustionRecoveryController.confirm", { amount })

        resolved = true
        resolve(amount)
    }

    function cancel()
    {
        logger?.debug?.("FeyExhaustionRecoveryController.cancel")

        if (!resolved) {
            resolve(null)
        }
    }

    return Object.freeze({
        confirm,
        cancel
    })
}