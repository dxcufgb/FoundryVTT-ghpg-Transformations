export function createApplyFiendGiftOfDamnation({
    tracker,
    activeEffectRepository,
    advancementChoiceHandler,
    getItems = () => game.items,
    logger = null
})
{
    logger?.debug?.("createApplyFiendGiftOfDamnation", {
        tracker,
        activeEffectRepository,
        advancementChoiceHandler
    })

    return async function applyFiendGiftOfDamnation({
        actor,
        gift
    })
    {
        logger?.debug?.("applyFiendGiftOfDamnation", {
            actor,
            giftId: gift?.id
        })

        return tracker.track(
            (async () =>
            {
                if (!actor || !gift?.GiftClass) {
                    return null
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

                    const items = getItems().filter(item =>
                        item.flags?.transformations?.createdBy === "giftOfDamnation" &&
                        item.flags?.transformations?.tempItem === true
                    )

                    for (const item of items) {
                        await item.delete()
                    }

                    const key =
                        existingEffects[0].flags.transformations.giftOfDamnationId

                    await actor.update({
                        [`flags.transformations.fiend.-=${key}`]: null
                    })
                }

                const changesToApply =
                    typeof gift.GiftClass.changes === "function"
                        ? await gift.GiftClass.changes({
                            actor,
                            advancementChoiceHandler
                        })
                        : gift.GiftClass.changes

                const description =
                    gift.GiftClass.overridenDescription ??
                    gift.GiftClass.description

                return activeEffectRepository.create({
                    actor,
                    name: gift.label,
                    description,
                    changes: changesToApply,
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
            })()
        )
    }
}
