// infrastructure/repositories/activeEffectRepository.js

export function createActiveEffectRepository({
    tracker,
    debouncedTracker,
    logger
})
{
    logger.debug("createActiveEffectRepository", {
        tracker,
        debouncedTracker
    })

    function getAll(actor)
    {
        logger.debug("createActiveEffectRepository.getAll", { actor })
        if (!actor) return []
        return Array.from(actor.effects ?? [])
    }

    function findByName(actor, name)
    {
        logger.debug("createActiveEffectRepository.findByName", { actor, name })
        if (!actor || !name) return null

        const effect = actor.effects.find(
            e => e.name === name
        )

        logger?.trace?.(
            "findByName",
            actor.id,
            name,
            Boolean(effect)
        )

        return effect ?? null
    }

    function findById(actor, effectId)
    {
        logger.debug("createActiveEffectRepository.findById", { actor, effectId })
        if (!actor || !effectId) return null

        return actor.effects.get(effectId) ?? null
    }

    function findBySourceUuid(actor, sourceUuid)
    {
        logger.debug("createActiveEffectRepository.findBySourceUuid", { actor, sourceUuid })
        if (!actor || !sourceUuid) return null

        return actor.effects.find(
            e => e.origin === sourceUuid
        ) ?? null
    }

    function findAllByName(actor, effectNames = [])
    {
        logger.debug("createActiveEffectRepository.findAllByName", { actor, effectNames })
        if (!actor || !effectNames.length) return false

        const foundEffects = []

        effectNames.forEach(name =>
        {
            foundEffects.push(findByName(actor, name))
        })

        return foundEffects.filter(e => e != undefined)
    }

    function hasAnyByName(actor, effectNames = [])
    {
        logger.debug("createActiveEffectRepository.hasAnyByName", { actor, effectNames })
        if (!actor || !effectNames.length) return false

        return effectNames.some(name =>
            findByName(actor, name) != null
        )
    }

    function hasAny(actor, effectIds = [])
    {
        logger.debug("createActiveEffectRepository.hasAny", { actor, effectIds })
        if (!actor || !effectIds.length) return false

        return effectIds.some(id =>
            actor.effects.has(id)
        )
    }

    function findManyByIds(actor, effectIds = [])
    {
        logger.debug("createActiveEffectRepository.findManyByIds", { actor, effectIds })
        if (!actor || !effectIds.length) return []

        return effectIds
            .map(id => actor.effects.get(id))
            .filter(Boolean)
    }

    function findByOrigin(actor, origin)
    {
        logger.debug("createActiveEffectRepository.findByOrigin", { actor, origin })
        if (!actor || !origin) return []

        return actor.effects.find(e => e.origin == origin)
    }

    async function removeByIds(actor, effectIds = [])
    {
        logger.debug("createActiveEffectRepository.removeByIds", { actor, effectIds })
        if (!actor || !effectIds.length) return

        const existing =
            findManyByIds(actor, effectIds)

        if (!existing.length) return

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("deleteEmbeddedDocuments")
                await actor.deleteEmbeddedDocuments(
                    "ActiveEffect",
                    existing.map(e => e.id)
                )
            })()
        )
    }

    function hasByName(actor, name)
    {
        logger.debug("createActiveEffectRepository.hasByName", { actor, name })
        if (!actor || !name) return false

        return getAll(actor).some(e => e.name === name)
    }

    function getIdsByName(actor, name)
    {
        logger.debug("createActiveEffectRepository.getIdsByName", { actor, name })
        if (!actor || !name) return []

        return getAll(actor)
            .filter(e => e.name === name)
            .map(e => e.id)
    }

    async function create({
        actor,
        name,
        description,
        source = "transformation",
        icon = null,
        changes = [],
        duration = {},
        flags = {},
        context = {},
        origin = ""
    })
    {
        logger.debug("createActiveEffectRepository.create", {
            actor,
            name,
            description,
            source,
            icon,
            changes,
            duration,
            flags,
            context,
            origin
        })
        if (!actor || !name) {
            logger.warn("ActiveEffect.create called without actor or name")
            return null
        }

        logger.debug(
            "Creating active effect",
            actor.id,
            name
        )

        const effectData = {
            name,
            description,
            icon,
            changes,
            duration,
            origin,
            flags: {
                ...flags,
                ddbimporter: {
                    ...flags.ddbimporter,
                    ignoreItemImport: true
                },
                transformations: {
                    ...flags.transformations,
                    addedByTransformation: true,
                    source,
                    context
                }
            }
        }
        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("createEmbeddedDocuments")
                const [effect] = await actor.createEmbeddedDocuments(
                    "ActiveEffect",
                    [effectData]
                )
                return effect ?? null
            })()
        )
    }

    function getTransformationEffects(actor)
    {
        logger.debug("createActiveEffectRepository.getTransformationEffects", { actor })
        if (!actor) return []

        return actor.effects.filter(effect =>
            effect.getFlag("transformations", "addedByTransformation") === true
        )
    }

    async function clearTransformation(actor)
    {
        logger.debug("createActiveEffectRepository.clearTransformation", { actor })
        const effects = getTransformationEffects(actor)
        if (!effects.length) return

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("deleteEmbeddedDocuments")
                await actor.deleteEmbeddedDocuments(
                    "ActiveEffect",
                    effects.map(effect => effect.id)
                )
            })()
        )
    }


    function getEffectsRemoveOnLongRest(actor)
    {
        logger.debug("createActiveEffectRepository.getEffectsRemoveOnLongRest", { actor })
        if (!actor) return []

        return actor.effects.filter(effect =>
            effect.getFlag("transformations", "removeOnLongRest") === true
        )
    }

    async function removeEffectsOnLongRest(actor)
    {
        logger.debug("createActiveEffectRepository.removeEffectsOnLongRest", { actor })
        const effects = getEffectsRemoveOnLongRest(actor)
        if (!effects.length) return

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("deleteEmbeddedDocuments")
                await actor.deleteEmbeddedDocuments(
                    "ActiveEffect",
                    effects.map(e => e.id)
                )
            })()
        )
    }

    function removeByOrigin(actor, origin)
    {
        logger.debug("createActiveEffectRepository.removeByOrigin", { actor, origin })
        if (!actor || !origin) return

        const existing = findByOrigin(actor, origin)

        if (!existing) return

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("removeByOrigin")
                await actor.deleteEmbeddedDocuments(
                    "ActiveEffect",
                    [existing.id]
                )
            })()
        )

    }
    return Object.freeze({
        whenIdle: tracker.whenIdle,
        getAll,
        findByName,
        findAllByName,
        findById,
        findBySourceUuid,
        hasAny,
        hasAnyByName,
        findManyByIds,
        removeByIds,
        hasByName,
        getIdsByName,
        create,
        clearTransformation,
        removeEffectsOnLongRest,
        removeByOrigin
    })
}
