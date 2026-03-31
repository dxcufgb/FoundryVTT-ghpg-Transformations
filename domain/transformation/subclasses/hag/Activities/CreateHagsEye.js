const HAGS_EYE_UUID = "Compendium.transformations.gh-transformations.Item.K5VdnECeAQMHonCF"

export async function createHagsEye({
    actor,
    itemRepository
})
{
    if (!actor || !itemRepository) return null

    const sourceItem = await fromUuid(HAGS_EYE_UUID)
    if (!sourceItem) return null

    return itemRepository.addTransformationItem({
        actor,
        sourceItem
    })
}
