export function createTokenRepository({
    tracker,
    debouncedTracker,
    logger
})
{
    logger.debug("createTokenRepository", {
        tracker,
        debouncedTracker
    })

    return {
        getByUuid: async (uuid) =>
        {
            logger.debug("createTokenRepository.getByUuid", {})
            return tracker.track(
                (async () =>
                {
                    debouncedTracker.pulse("fromUUID")
                    return await fromUuid(uuid)
                })()
            )
        }
    }
}
