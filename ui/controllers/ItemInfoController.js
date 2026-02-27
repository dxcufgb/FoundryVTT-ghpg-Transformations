// item-info-controller.js
export function createItemInfoController({
    resolve,
    logger
})
{
    logger?.debug?.("createItemInfoController")

    let resolved = false

    async function continueAction()
    {
        logger?.debug?.("ItemInfoController.continue")

        resolved = true
        resolve(true)
    }

    function cancel()
    {
        logger?.debug?.("ItemInfoController.cancel")

        if (!resolved) {
            resolve(false)
        }
    }

    return Object.freeze({
        continue: continueAction,
        cancel
    })
}