import { giftsOfDamnation } from "../../domain/transformation/subclasses/fiend/giftsOfDamnation/index.js"

export function createFiendGiftOfDamnationController({
    actor,
    activeEffectRepository,
    resolve,
    logger
})
{
    logger?.debug?.("createFiendGiftOfDamnationController", {
        actor,
        activeEffectRepository
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

        const existingEffects = activeEffectRepository
            .getAll(actor)
            .filter(effect =>
                effect.flags?.transformations?.giftOfDamnation === true
            )

        if (existingEffects.length) {
            await activeEffectRepository.removeByIds(
                actor,
                existingEffects.map(effect => effect.id)
            )
        }

        const createdEffect = await activeEffectRepository.create({
            actor,
            name: gift.label,
            description: gift.GiftClass.description,
            changes: gift.GiftClass.changes,
            source: "giftOfDamnation",
            origin: actor?.uuid ?? "",
            flags: {
                transformations: {
                    giftOfDamnation: true,
                    giftOfDamnationId: gift.id
                }
            },
            icon: "modules/transformations/Icons/Transformations/Fiend/Devilish_Contractor.png"
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
