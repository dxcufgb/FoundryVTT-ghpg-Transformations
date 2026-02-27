// infrastructure/repositories/damageResistanceRepository.js

export function createDamageResistanceRepository({
    tracker,
    debouncedTracker,
    logger
})
{
    logger.debug("createDamageResistanceRepository", {
        tracker,
        debouncedTracker
    })

    function getAll(actor)
    {
        logger.debug("damageResistanceRepository.getAll", { actor })
        if (!actor) return []

        return Array.from(
            actor.system?.traits?.dr?.value ?? []
        )
    }

    function has(actor, type)
    {
        logger.debug("damageResistanceRepository.has", { actor, type })
        if (!actor || !type) return

        return getAll(actor).includes(type)
    }

    async function add(actor, type)
    {
        logger.debug("damageResistanceRepository.add", { actor, type })
        if (!actor || !type) return

        const current = getAll(actor)

        if (current.includes(type)) {
            logger.debug(
                "Damage resistance already present, skipping",
                actor.id,
                type
            )
            return
        }

        const updated = [...current, type]

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("updateDamageResistance")

                await actor.update({
                    "system.traits.dr.value": updated
                })
                return true
            })()
        )
    }

    async function remove(actor, type)
    {
        logger.debug("damageResistanceRepository.remove", { actor, type })
        if (!actor || !type) return

        const current = getAll(actor)

        if (!current.includes(type)) return

        const updated =
            current.filter(t => t !== type)

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("updateDamageResistance")

                await actor.update({
                    "system.traits.dr.value": updated
                })
                return true
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        getAll,
        has,
        add,
        remove
    })
}