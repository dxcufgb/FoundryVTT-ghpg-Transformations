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

    return Object.freeze({
        getAll,
        findByName,
        findAllByName,
        findById,
        findBySourceUuid,
        hasAny,
        hasAnyByName,
        findManyByIds,
        removeByIds
    });
}
