export function getPreRollSavingThrowContext({
    ability,
    originType
})
{
    return {
        ability: ability,
        advantage: null,
        disadvantage: null,
        workflow: {
            item: {
                type: originType
            }
        }
    }
}