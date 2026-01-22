export function createEffectRepository({ logger }) {

    function getAllForActor(actor) {
        if (!actor) return [];
        return Array.from(actor.effects);
    }

    function getForTransformation(actor, definitionId = null) {
        if (!actor) return [];

        const activeDefinitionId = definitionId ?? actor.flags?.dnd5e?.transformations;

        if (!activeDefinitionId) return [];

        return actor.effects.filter(effect => effect.flags?.transformations?.definitionId === activeDefinitionId
        );
    }

    function getForTrigger(actor, trigger) {
        if (!actor || !trigger) return [];

        return getForTransformation(actor).filter(effect =>
            effect.flags?.transformations?.trigger === trigger
        );
    }

    function getForStage(actor, stage = null) {
        if (!actor) return [];

        const activeStage =
            stage ??
            actor.flags?.dnd5e?.transformationStage;

        if (!activeStage) return [];

        return getForTransformation(actor).filter(effect =>
            effect.flags?.transformations?.stage === activeStage
        );
    }

    function hasEffectFromSource(actor, sourceUuid) {
        if (!actor || !sourceUuid) return false;

        return actor.effects.some(effect => {
            const source =
                effect.origin ??
                effect.flags?.core?.sourceId ??
                effect.flags?.transformations?.sourceUuid;

            return source === sourceUuid;
        });
    }

    return {
        getAllForActor,
        getForTransformation,
        getForTrigger,
        getForStage,
        hasEffectFromSource
    };
}
