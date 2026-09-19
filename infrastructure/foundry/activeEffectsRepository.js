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
                transformations: buildTransformationEffectFlags({
                    actor,
                    flags: flags.transformations,
                    source,
                    context,
                    origin
                })
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

    async function createFromUuid({
        actor,
        uuid,
        source = "instantiated",
        flags = {},
        context = {}
    })
    {
        logger.debug("createActiveEffectRepository.createFromUuid", {
            actor,
            uuid,
            source,
            flags,
            context
        })
        if (!actor || !uuid) {
            logger.warn("ActiveEffect.createFromUuid called without actor or uuid")
            return null
        }

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("fromUuid")
                const sourceEffect = await fromUuid(uuid)

                if (!sourceEffect) {
                    logger.warn("ActiveEffect not found for UUID", uuid)
                    return null
                }

                const effectData =
                    typeof sourceEffect?.toObject === "function"
                        ? foundry.utils.deepClone(sourceEffect.toObject())
                        : foundry.utils.deepClone(sourceEffect)

                if (!effectData?.name) {
                    logger.warn("Resolved ActiveEffect UUID is missing effect data", uuid)
                    return null
                }

                effectData.flags ??= {}
                effectData.origin = effectData.origin || uuid
                effectData.flags = {
                    ...effectData.flags,
                    ...flags,
                    ddbimporter: {
                        ...(effectData.flags.ddbimporter ?? {}),
                        ...(flags.ddbimporter ?? {}),
                        ignoreItemImport: true
                    },
                    transformations: buildTransformationEffectFlags({
                        actor,
                        flags: {
                            ...(effectData.flags.transformations ?? {}),
                            ...(flags.transformations ?? {})
                        },
                        source,
                        context,
                        origin: effectData.origin || uuid,
                        sourceUuid: uuid
                    })
                }

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

    function getTransformationEffectsForStage(actor, {
        definitionId,
        stage,
        origins = []
    } = {})
    {
        logger.debug("createActiveEffectRepository.getTransformationEffectsForStage", {
            actor,
            definitionId,
            stage,
            origins
        })
        if (!actor || stage == null) return []

        const originSet = new Set(
            (Array.isArray(origins) ? origins : [origins])
            .filter(origin => typeof origin === "string" && origin.length > 0)
        )

        return actor.effects.filter(effect =>
            isTransformationEffectForStage(effect, {
                definitionId,
                stage,
                origins: originSet
            })
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

    async function removeTransformationEffectsForStage(actor, {
        definitionId,
        stage,
        origins = []
    } = {})
    {
        logger.debug("createActiveEffectRepository.removeTransformationEffectsForStage", {
            actor,
            definitionId,
            stage,
            origins
        })
        const effects = getTransformationEffectsForStage(actor, {
            definitionId,
            stage,
            origins
        })

        if (!effects.length) return []

        return tracker.track(
            (async () =>
            {
                debouncedTracker.pulse("deleteEmbeddedDocuments")
                await actor.deleteEmbeddedDocuments(
                    "ActiveEffect",
                    effects.map(effect => effect.id)
                )

                return effects
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
        createFromUuid,
        clearTransformation,
        getTransformationEffectsForStage,
        removeTransformationEffectsForStage,
        removeEffectsOnLongRest,
        removeByOrigin
    })

    function isTransformationEffectForStage(effect, {
        definitionId,
        stage,
        origins
    } = {})
    {
        if (!effect?.flags?.transformations) return false

        const flags = effect.flags.transformations
        if (flags.addedByTransformation !== true) return false

        const grantedBy = flags.grantedBy ?? {}
        const effectDefinitionId =
                  grantedBy.transformationId ??
                  flags.definitionId ??
                  null

        const definitionMatches =
                  !effectDefinitionId ||
                  !definitionId ||
                  effectDefinitionId === definitionId

        if (!definitionMatches) return false

        if (origins?.has?.(effect.origin)) {
            return true
        }

        const effectStage = Number(grantedBy.stage ?? flags.stage)
        if (!Number.isFinite(effectStage) || effectStage !== Number(stage)) {
            return false
        }

        return Boolean(
            grantedBy.grantType ||
            flags.advancementGrant ||
            flags.advancementChoice ||
            flags.advancementChoiceType ||
            flags.advancementGrantType
        )
    }

    function buildTransformationEffectFlags({
        actor,
        flags = {},
        source,
        context = {},
        origin = "",
        sourceUuid = null
    } = {})
    {
        flags ??= {}
        const originItem = findOriginItem(actor, origin)
        const originItemFlags = originItem?.flags?.transformations ?? {}

        const transformationId =
                  flags?.grantedBy?.transformationId ??
                  flags?.definitionId ??
                  originItemFlags?.grantedBy?.transformationId ??
                  originItemFlags?.definitionId ??
                  actor?.flags?.transformations?.type ??
                  null
        const transformationStage =
                  flags?.grantedBy?.stage ??
                  flags?.stage ??
                  originItemFlags?.grantedBy?.stage ??
                  originItemFlags?.stage ??
                  actor?.flags?.transformations?.stage ??
                  null
        const resolvedSourceUuid =
                  flags?.grantedBy?.sourceUuid ??
                  flags?.sourceUuid ??
                  originItemFlags?.sourceUuid ??
                  sourceUuid ??
                  origin ??
                  null
        const isAdvancementGrant = Boolean(
            flags?.advancementGrant ||
            flags?.advancementChoice ||
            flags?.advancementChoiceType ||
            flags?.advancementGrantType ||
            originItem
        )
        const grantType =
                  flags?.grantedBy?.grantType ??
                  flags?.grantType ??
                  (isAdvancementGrant ? "advancement" : null)

        return {
            ...flags,
            definitionId: transformationId,
            stage: transformationStage,
            addedByTransformation: true,
            source,
            context,
            grantedBy: {
                ...(flags?.grantedBy ?? {}),
                transformationId,
                stage: transformationStage,
                sourceUuid: resolvedSourceUuid,
                grantType
            }
        }
    }

    function findOriginItem(actor, origin)
    {
        if (!actor || !origin) return null

        return actor.items?.find?.(item =>
            item?.uuid === origin ||
            item?.id === origin ||
            item?.flags?.transformations?.sourceUuid === origin
        ) ?? null
    }
}
