// infrastructure/repositories/activeEffectRepository.js

export function createActiveEffectRepository({ logger }) {

    function getAll(actor) {
        if (!actor) return [];
        return Array.from(actor.effects ?? []);
    }

    function findByName(actor, name) {
        if (!actor || !name) return null;

        const effect = actor.effects.find(
            e => e.name === name
        );

        logger?.trace?.(
            "findByName",
            actor.id,
            name,
            Boolean(effect)
        );

        return effect ?? null;
    }

    function findById(actor, effectId) {
        if (!actor || !effectId) return null;

        return actor.effects.get(effectId) ?? null;
    }

    function findBySourceUuid(actor, sourceUuid) {
        if (!actor || !sourceUuid) return null;

        return actor.effects.find(
            e => e.origin === sourceUuid
        ) ?? null;
    }

    function findAllByName(actor, effectNames = []) {
        if (!actor || !effectNames.length) return false;

        const foundEffects = [];

        effectNames.forEach(name => {
            foundEffects.push(findByName(actor, name));
        });

        return foundEffects.filter(e => e != undefined);
    }

    function hasAnyByName(actor, effectNames = []) {
        if (!actor || !effectNames.length) return false;

        return effectNames.some(name =>
            findByName(actor, name) != null
        );
    }

    function hasAny(actor, effectIds = []) {
        if (!actor || !effectIds.length) return false;

        return effectIds.some(id =>
            actor.effects.has(id)
        );
    }

    function findManyByIds(actor, effectIds = []) {
        if (!actor || !effectIds.length) return [];

        return effectIds
            .map(id => actor.effects.get(id))
            .filter(Boolean);
    }

    async function removeByIds(actor, effectIds = []) {
        if (!actor || !effectIds.length) return;

        const existing =
            findManyByIds(actor, effectIds);

        if (!existing.length) return;

        await actor.deleteEmbeddedDocuments(
            "ActiveEffect",
            existing.map(e => e.id)
        );
    }

    function hasByName(actor, name) {
        if (!actor || !name) return false;

        return getAll(actor).some(e => e.name === name);
    }

    function getIdsByName(actor, name) {
        if (!actor || !name) return [];

        return getAll(actor)
            .filter(e => e.name === name)
            .map(e => e.id);
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
        context = {}
    }) {
        if (!actor || !name) {
            logger.warn("ActiveEffect.create called without actor or name");
            return null;
        }

        logger.debug(
            "Creating active effect",
            actor.id,
            name
        );

        const effectData = {
            name,
            description,
            icon,
            changes,
            duration,
            flags: {
                transformations: {
                    addedByTransformation: true,
                    source,
                    context
                },
                ...flags
            }
        };

        const [effect] =
            await actor.createEmbeddedDocuments(
                "ActiveEffect",
                [effectData]
            );

        return effect ?? null;
    }

    function getEffectsRemoveOnLongRest(actor) {
        if (!actor) return [];

        return actor.effects.filter(effect =>
            effect.getFlag("transformations", "removeOnLongRest") === true
        );
    }

    async function removeEffectsOnLongRest(actor) {
        const effects = getEffectsRemoveOnLongRest(actor);
        if (!effects.length) return;

        await actor.deleteEmbeddedDocuments(
            "ActiveEffect",
            effects.map(e => e.id)
        );
    }


    return Object.freeze({
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
        removeEffectsOnLongRest
    });
}
