export function createTransformationRegistry() {
    const registry = new Map();

    function register({
        uuid,
        TransformationClass,
        TransformationDefinition,
        TransformationStages,
        TransformationTriggers,
        TransformationRollTableEffects,
        TransformationMacros
    }) {
        if (!TransformationClass?.itemId) {
            throw new Error("TransformationClass must define itemId");
        }
        if (!uuid) {
            throw new Error("Transformation must define uuid");
        }

        registry.set(TransformationClass.itemId, Object.freeze({
            itemId: TransformationClass.itemId,
            uuid,
            TransformationClass,
            TransformationDefinition,
            TransformationStages,
            TransformationTriggers,
            TransformationRollTableEffects,
            TransformationMacros
        }));
    }

    function getEntryForActor(actor) {
        const itemId = actor?.flags?.dnd5e?.transformations;

        if (!itemId) return null;

        return getEntryByItemId(itemId);
    }

    function getEntryByItemId(itemId) {
        return registry.get(itemId) ?? null;
    }

    function getAllEntries() {
        return Array.from(registry.values());
    }

    function getRollTableEffectsByType() {
        const map = {};

        for (const entry of registry.values()) {
            const type = entry.TransformationClass?.type;
            if (!type) continue;

            if (entry.TransformationRollTableEffects) {
                map[type] = entry.TransformationRollTableEffects;
            }
        }

        return map;
    }

    return Object.freeze({
        register,
        getEntryForActor,
        getEntryByItemId,
        getAllEntries,
        getRollTableEffectsByType
    });
}
