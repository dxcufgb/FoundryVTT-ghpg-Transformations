export function createActorQueryService({
    actorRepository,
    logger
})
{
    logger.debug("createActorQueryService", { actorRepository })

    function getById(actorId)
    {
        logger.debug("createActorQueryService.getById", { actorId })
        return actorRepository.getById(actorId)
    }

    function getByUuid(actorId)
    {
        logger.debug("createActorQueryService.getByUuid", { actorId })
        return actorRepository.getByUuid(actorId)
    }

    return Object.freeze({
        getById,
        getByUuid
    })
}
