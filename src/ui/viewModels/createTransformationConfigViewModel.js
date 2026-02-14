export function createTransformationConfigViewModel({
    actor,
    transformations
})
{
    const activeId = actor.flags?.transformations?.type ?? "None"

    return {
        actor: {
            id: actor.id,
            name: actor.name
        },
        transformations: [
            { itemId: "None", name: "None", active: activeId === "None", img: "systems/dnd5e/icons/svg/statuses/incapacitated.svg" },
            ...transformations.map(t => ({
                itemId: t.itemId,
                name: t.definition.name,
                img: t.definition.img,
                active: t.itemId === activeId
            }))
        ],
        selectedTransformation: activeId
    }
}