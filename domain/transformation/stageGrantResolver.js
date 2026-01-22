export function createStageGrantResolver({
    logger
}) {

    function resolve({ definition, stage }) {
        if (!definition || !stage) {
            return empty();
        }

        const stageDef =
            definition.stages?.get?.(stage) ??
            definition.stages?.[stage];

        if (!stageDef) {
            return empty();
        }

        return {
            items: normalizeItems(stageDef.grants?.items),
            creatureSubType: stageDef.grants?.actor?.creatureSubType ?? null
        };
    }

    function normalizeItems(items = []) {
        if (!Array.isArray(items)) return [];

        return items.map(item => ({
            uuid: item.uuid,
            replacesUuid: item.replaces?.uuid ?? null,
            isPrerequisite: Boolean(item.isPrerequisite)
        }));
    }

    function empty() {
        return {
            items: [],
            creatureSubType: null
        };
    }

    return Object.freeze({
        resolve
    });
}
