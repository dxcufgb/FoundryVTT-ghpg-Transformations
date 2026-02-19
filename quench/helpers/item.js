export async function getOrCreateItem({
    name,
    type,
    system = {}
})
{
    const existing = game.items.find(i =>
        i.name === name && i.type === type
    )

    if (existing) {
        return existing
    }

    // Otherwise create it
    return await Item.create({
        name,
        type,
        system,
        flags: {
            transformations: {
                testItem: true
            }

        }
    })
}
