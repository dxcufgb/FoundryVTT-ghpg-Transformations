export function createTokenRepository({
    tracker,
    debouncedTracker,
    logger
})
{
    return {
        getByUuid: async () =>
        {
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
