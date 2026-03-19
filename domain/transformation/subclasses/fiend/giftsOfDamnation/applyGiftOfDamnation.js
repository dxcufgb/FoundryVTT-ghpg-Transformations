const GIFT_OF_DAMNATION_ICON =
    "modules/transformations/Icons/Transformations/Fiend/Devilish_Contractor.png"

export async function applyGiftOfDamnation({
    actor,
    giftClass,
    itemRepository,
    sourceItem = null,
    itemOptions = {},
    changes = [],
    description = giftClass?.description ?? "",
    flagData = {}
})
{
    if (!actor || !giftClass) {
        return null
    }

    const createdItems = []

    if (sourceItem) {
        const createdItem = await itemRepository?.createObjectOnActor(
            actor,
            sourceItem,
            "",
            itemOptions
        )

        if (createdItem) {
            createdItems.push(createdItem)
        }
    }

    const [effect] = await actor.createEmbeddedDocuments("ActiveEffect", [{
        name: giftClass.label ?? giftClass.id,
        description,
        icon: GIFT_OF_DAMNATION_ICON,
        changes,
        origin: actor?.uuid ?? "",
        flags: {
            ddbimporter: {
                ignoreItemImport: true
            },
            transformations: {
                addedByTransformation: true,
                source: "giftOfDamnation",
                context: {},
                giftOfDamnation: true,
                giftOfDamnationId: giftClass.id
            }
        }
    }])

    if (!effect) {
        if (createdItems.length) {
            await actor.deleteEmbeddedDocuments(
                "Item",
                createdItems.map(item => item.id)
            )
        }

        return null
    }

    await actor.update({
        [`flags.transformations.fiend.${giftClass.id}`]: {
            ...flagData,
            effectId: effect.id,
            itemIds: createdItems.map(item => item.id)
        }
    })

    return effect
}
