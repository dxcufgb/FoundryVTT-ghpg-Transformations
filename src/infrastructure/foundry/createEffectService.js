export function createEffectService({
    actorRepository,
    logger
}) {

    async function applyEffect(actor, effectData, context = {}) {
        if (!actor || !effectData) return;

        logger.debug("Applying ActiveEffect", {
            actorId: actor.id,
            effectData,
            context
        });

        const data = {
            ...structuredClone(effectData),
            flags: {
                ...effectData.flags,
                transformations: {
                    ...(effectData.flags?.transformations ?? {}),
                    source: context.source,
                    stage: context.stage,
                    trigger: context.trigger
                }
            }
        };

        await actor.createEmbeddedDocuments("ActiveEffect", [data]);
    }

    async function removeEffect(actor, predicate) {
        if (!actor || typeof predicate !== "function") return;

        const toRemove = actor.effects.filter(predicate);

        if (!toRemove.length) return;

        logger.debug(
            "Removing ActiveEffects",
            actor.id,
            toRemove.map(e => e.id)
        );

        await actor.deleteEmbeddedDocuments(
            "ActiveEffect",
            toRemove.map(e => e.id)
        );
    }

    async function removeEffectsBySource(actor, source) {
        return removeEffect(
            actor,
            effect =>
                effect.getFlag("transformations", "source") === source
        );
    }

    function hasEffect(actor, predicate) {
        if (!actor || typeof predicate !== "function") return false;
        return actor.effects.some(predicate);
    }

    return Object.freeze({
        applyEffect,
        removeEffect,
        removeEffectsBySource,
        hasEffect
    });
}
