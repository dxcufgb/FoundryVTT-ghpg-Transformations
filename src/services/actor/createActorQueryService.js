export function createActorQueryService({
    actorRepository
})
{
    function getById(actorId)
    {
        return actorRepository.getById(actorId)
    }

    function getByUuid(actorId)
    {
        return actorRepository.getByUuid(actorId)
    }

    return Object.freeze({
        getById,
        getByUuid
    })
}