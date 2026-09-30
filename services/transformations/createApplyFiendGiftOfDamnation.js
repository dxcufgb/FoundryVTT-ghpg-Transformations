import { evaluateGiftSwitch } from "../../domain/transformation/subclasses/fiend/giftsOfDamnation/giftContracts.js"

const SECOND_GIFT_OF_DAMNATION_SLOT_SOURCE_UUID =
    "Compendium.transformations.gh-transformations.Item.1DPOphqvUFg1Yzfm"

export function createApplyFiendGiftOfDamnation({
    tracker,
    activeEffectRepository,
    actorRepository,
    advancementChoiceHandler,
    itemRepository,
    getDialogFactory,
    logger = null
})
{
    logger?.debug?.("createApplyFiendGiftOfDamnation", {
        tracker,
        activeEffectRepository,
        actorRepository,
        advancementChoiceHandler,
        itemRepository,
        getDialogFactory
    })

    async function applyFiendGiftOfDamnation({
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

                const maxActiveEffects = actor.items.some(item =>
                    item.flags?.transformations?.sourceUuid ===
                    SECOND_GIFT_OF_DAMNATION_SLOT_SOURCE_UUID
                )
                    ? 2
                    : 1

                const decision = evaluateGiftSwitch(actor, gift.id, {
                    replacing: existingEffects.length >= maxActiveEffects,
                    label: gift.label
                })
                if (!decision.allowed) {
                    if (globalThis.__TRANSFORMATIONS_TEST__ !== true) {
                        globalThis.ui?.notifications?.warn?.(decision.reason)
                    }
                    logger?.debug?.("Gift of Damnation switch blocked", decision)
                    return null
                }

                let replacedGift = false
                if (existingEffects.length >= maxActiveEffects) {
                    if (maxActiveEffects === 1) {
                        await removeGiftEffects(actor, existingEffects)
                        replacedGift = true
                    } else {
                        const effectIdToRemove =
                            await chooseGiftEffectToRemove(actor, existingEffects)

                        if (!effectIdToRemove) {
                            return null
                        }

                        const effectToRemove = existingEffects.find(effect =>
                            effect.id === effectIdToRemove
                        )

                        if (!effectToRemove) {
                            logger?.warn?.(
                                "Selected Gift of Damnation effect not found",
                                effectIdToRemove
                            )
                            return null
                        }

                        await removeGiftEffects(actor, [effectToRemove])
                        replacedGift = true
                    }
                }

                if (typeof gift.GiftClass.apply !== "function") {
                    return null
                }

                return gift.GiftClass.apply({
                    actor,
                    actorRepository,
                    itemRepository,
                    advancementChoiceHandler,
                    replacedGift
                })
            })()
        )
    }

    return Object.freeze(
        Object.assign(applyFiendGiftOfDamnation, {
            whenIdle: tracker.whenIdle
        })
    )

    async function removeGiftEffects(actor, effects)
    {
        const giftIds = [
            ...new Set(
                effects
                    .map(effect =>
                        effect.flags?.transformations?.giftOfDamnationId
                    )
                    .filter(Boolean)
            )
        ]

        for (const giftId of giftIds) {
            const linkedItemIds =
                actor.flags?.transformations?.fiend?.[giftId]?.itemIds

            if (Array.isArray(linkedItemIds) && linkedItemIds.length) {
                const existingItemIds = linkedItemIds.filter(itemId =>
                    actor.items.get(itemId)
                )

                if (existingItemIds.length) {
                    await actor.deleteEmbeddedDocuments(
                        "Item",
                        existingItemIds
                    )
                }
            }

            await actor.update({
                [`flags.transformations.fiend.-=${giftId}`]: null
            })
        }

        await activeEffectRepository.removeByIds(
            actor,
            effects.map(effect => effect.id)
        )
    }

    async function chooseGiftEffectToRemove(actor, existingEffects)
    {
        const dialogFactory = getDialogFactory?.()
        if (!dialogFactory?.openTransformationGeneralChoiceDialog) {
            logger?.warn?.(
                "Gift of Damnation removal choice requested without dialogFactory"
            )
            return null
        }

        return dialogFactory.openTransformationGeneralChoiceDialog({
            actor,
            choices: existingEffects.map(effect =>
            {
                const giftId =
                    effect.flags?.transformations?.giftOfDamnationId
                const linkedItemIds =
                    actor.flags?.transformations?.fiend?.[giftId]?.itemIds
                const linkedItemId = Array.isArray(linkedItemIds)
                    ? linkedItemIds.find(itemId => actor.items.get(itemId))
                    : null
                const linkedItem = linkedItemId
                    ? actor.items.get(linkedItemId)
                    : null

                return {
                    id: effect.id,
                    icon: linkedItem?.img ?? effect.icon,
                    label: linkedItem?.name ?? effect.name
                }
            }),
            title: "choose an effect to remove",
            triggeringUserId: game.user?.id ?? null
        })
    }
}
