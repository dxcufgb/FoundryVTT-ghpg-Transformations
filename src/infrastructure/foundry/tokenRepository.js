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
        getByUuid: async () =>
        {
            logger.debug("createTokenRepository.getByUuid", {})
            return tracker.track(
                (async () =>
                {
                    debouncedTracker.pulse("fromUUID")
                    await fromUuid(uuid)
                })()
            )
        }
    }
}
