import { recordGiftGained } from "./giftContracts.js"

const GIFT_OF_DAMNATION_ICON =
          "modules/transformations/Icons/Transformations/Fiend/Devilish_Contractor.png"

export async function applyGiftOfDamnation({
    actor,
    giftClass,
    itemRepository,
    actorRepository,
    sourceItem = null,
    itemOptions = {},
    changes = [],
    description = giftClass?.description ?? "",
    flagData = {},
    replacedGift = false
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

    // Remember the signed contract and use up the new contract or the
    // rest's switch that allowed gaining this gift.
    await recordGiftGained(actor, giftClass.id, {replacedGift})

    const enhancedContract = itemRepository.findEmbeddedByUuidFlag(
        actor,
        "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
    )
    
    // Enhanced Contract: temp HP only when an active gift was switched out,
    // not when the first gift (or an extra Subcontractor slot) is filled.
    if (
        replacedGift &&
        enhancedContract &&
        itemRepository.getRemainingUses(enhancedContract) > 0
    )
    {
        const amount = (actor.flags.transformations.stage ?? 0) * 5
        await actorRepository.addTempHp(actor, amount)
        await itemRepository.consumeUses(enhancedContract, 1)
    }

    return effect
}
