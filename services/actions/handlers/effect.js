// services/actions/effect.js

export function createEffectAction({
    activeEffectRepository,
    tracker,
    logger
})
{
    logger.debug("createEffectAction", {
        activeEffectRepository,
        tracker
    })

    return async function EFFECT_ACTION({
        actor,
        action,
        context
    })
    {
        logger.debug("createEffectAction.EFFECT_ACTION", {
            actor,
            action,
            context
        })
        const { mode, name, active, source } = action.data ?? {}

        if (!mode || !name) {
            logger.warn("EFFECT action missing mode or name", action)
            return
        }

        return tracker.track(
            (async () =>
            {

                logger.debug(
                    "Executing EFFECT action",
                    actor.id,
                    mode,
                    name
                )

                switch (mode) {
                    case "apply":
                        await applyEffect({
                            actor,
                            name,
                            source,
                            context
                        })
                        break

                    case "remove":
                        await removeEffect({
                            actor,
                            name
                        })
                        break

                    case "toggle":
                        actor.toggleStatusEffect(name, { active: active })
                        break
                    default:
                        logger.warn("Unknown EFFECT action mode", mode)
                }
            })()
        )
    }

    async function applyEffect({
        actor,
        name,
        source,
        context
    })
    {
        logger.debug("createEffectAction.applyEffect", {
            actor,
            name,
            source,
            context
        })
        if (activeEffectRepository.hasByName(actor, name)) {
            logger.debug(
                "Effect already present, skipping",
                actor.id,
                name
            )
            return
        }

        return tracker.track(
            (async () =>
            {
                await activeEffectRepository.create({
                    actor,
                    name,
                    source: source ?? "transformation",
                    context
                })
            })()
        )
    }

    async function removeEffect({
        actor,
        name
    })
    {
        logger.debug("createEffectAction.removeEffect", { actor, name })
        const ids = activeEffectRepository.getIdsByName(actor, name)

        if (!ids.length) return

        return tracker.track(
            (async () =>
            {

                await activeEffectRepository.removeByIds(actor, ids)
            })()
        )
    }
}
