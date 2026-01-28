export function createActorQueryService({
    actorRepository
}) {
    function getById(actorId) {
        return actorRepository.getById(actorId);
    }

    return Object.freeze({
        getById
    });
}