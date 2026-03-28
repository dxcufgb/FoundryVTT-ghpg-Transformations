import { giftsOfDamnation } from "../../domain/transformation/subclasses/fiend/giftsOfDamnation/index.js"

export function createFiendGiftOfDamnationController({
    actor,
    applyFiendGiftOfDamnation,
    resolve,
    logger
})
{
    logger?.debug?.("createFiendGiftOfDamnationController", {
        actor,
        applyFiendGiftOfDamnation
    })

    let resolved = false

    async function confirm(giftId)
    {
        logger?.debug?.("FiendGiftOfDamnationController.confirm", {
            actor,
            giftId
        })

        const gift = giftsOfDamnation.find(entry => entry.id === giftId)
        if (!gift) {
            resolve(false)
            resolved = true
            return
        }

        const createdEffect = await applyFiendGiftOfDamnation?.({
            actor,
            gift
        })

        resolved = true
        resolve(Boolean(createdEffect))
    }

    function cancel()
    {
        logger?.debug?.("FiendGiftOfDamnationController.cancel")

        if (!resolved) {
            resolve(null)
        }
    }

    return Object.freeze({
        confirm,
        cancel
    })
}
