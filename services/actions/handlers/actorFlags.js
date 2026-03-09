export function createActorFlagAction({
    tracker,
    logger
})
{
    logger.debug("createActorFlagAction", { tracker })

    return async function ACTOR_FLAG({
        actor,
        action,
        context
    })
    {
        const { mode, key, value } = action.data ?? {}

        const scope = "transformations"

        return tracker.track(
            (async () =>
            {

                if (!actor) {
                    logger.warn("ACTOR_FLAG: Missing actor")
                    return false
                }

                if (!scope || !key) {
                    logger.warn("ACTOR_FLAG: Missing scope or key", action)
                    return false
                }

                switch (mode) {

                    case "set": {
                        await actor.setFlag(scope, key, value)
                        return true
                    }

                    case "remove": {
                        await actor.unsetFlag(scope, key)
                        return true
                    }

                    default:
                        logger.warn("Unknown ACTOR_FLAG mode", mode, action)
                        return false
                }

            })()
        )
    }
}