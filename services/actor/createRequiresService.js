export function createRequiresService({
    conditionService,
    logger
})
{
    function actorHasItems({
        actor,
        items
    })
    {
        const hasAll = items.every(reqUuid =>
            actor.items.some(actorItem =>
                actorItem.flags?.transformations?.sourceUuid === reqUuid
            )
        )
        return hasAll
    }

    function actorHasRequirement({
        actor,
        choiceDef
    })
    {
        const requirements = Array.isArray(choiceDef.requires.actor)
            ? choiceDef.requires.actor
            : [choiceDef.requires.actor]

        for (const requirement of requirements) {
            if (!conditionService.checkActorRequirement({
                actor,
                requirement
            })) {
                return false
            }
        }
        return true
    }

    return {
        actorHasItems,
        actorHasRequirement
    }
}