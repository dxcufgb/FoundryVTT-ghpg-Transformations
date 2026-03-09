export function createExhaustionAction({
    tracker,
    logger
})
{
    logger.debug("createExhaustionAction", { tracker })

    return async function EXHAUSTION({
        actor,
        action,
        context
    })
    {
        const { mode, amount = 1 } = action.data ?? {}

        return tracker.track(
            (async () =>
            {

                if (!actor) {
                    logger.warn("EXHAUSTION: Missing actor")
                    return false
                }

                const current = actor.system?.attributes?.exhaustion ?? 0

                switch (mode) {

                    case "add": {
                        const next = Math.min(current + amount, 6) // hard cap
                        if (next === current) return false

                        await actor.update({
                            "system.attributes.exhaustion": next
                        })

                        return true
                    }

                    case "remove": {
                        const next = Math.max(current - amount, 0)
                        if (next === current) return false

                        await actor.update({
                            "system.attributes.exhaustion": next
                        })

                        return true
                    }

                    default:
                        logger.warn("Unknown EXHAUSTION mode", mode, action)
                        return false
                }

            })()
        )
    }
}