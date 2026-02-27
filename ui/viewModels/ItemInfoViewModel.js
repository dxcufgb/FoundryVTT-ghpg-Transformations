// item-info-viewmodel.js
export function createItemInfoViewModel({
    item,
    logger = null
})
{
    logger?.debug?.("createItemInfoViewModel", { item })

    return {
        name: item.name,
        icon: item.img,
        description: item.system?.description?.value ?? ""
    }
}