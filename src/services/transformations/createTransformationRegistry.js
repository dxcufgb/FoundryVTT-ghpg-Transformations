export function createTransformationRegistry()
{
    const registry = new Map()

    function register({
        uuid,
        TransformationClass,
        TransformationDefinition,
        TransformationStages,
        TransformationTriggers,
        TransformationRollTableEffects,
        TransformationMacros
    })
    {
        if (!TransformationClass?.itemId) {
            throw new Error("TransformationClass must define itemId")
        }
        if (!uuid) {
            throw new Error("Transformation must define uuid")
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
        }))
    }

    function getEntryForActor(actor)
    {
        const itemId = actor?.flags?.transformations?.type

        if (!itemId) return null

        return getEntryByItemId(itemId)
    }

    function getEntryByItemId(itemId)
    {
        return registry.get(itemId) ?? null
    }

    function getAllEntries()
    {
        return Array.from(registry.values())
    }

    function getRollTableEffectsByType()
    {
        const map = {}

        for (const entry of registry.values()) {
            const type = entry.TransformationClass?.type
            if (!type) continue

            if (entry.TransformationRollTableEffects) {
                map[type] = entry.TransformationRollTableEffects
            }
        }

        return map
    }

    function getRollTableEffectsByKey()
    {
        const effectsByKey = Object.create(null)

        for (const entry of registry.values()) {
            const effects = entry.TransformationRollTableEffects
            if (!effects) continue

            for (const EffectClass of Object.values(effects)) {
                const key = EffectClass?.meta?.key

                if (!key) {
                    throw new Error(
                        `RollTableEffect missing meta.key in ${EffectClass?.name}`
                    )
                }

                if (effectsByKey[key]) {
                    throw new Error(
                        `Duplicate RollTableEffect key detected: '${key}'`
                    )
                }

                effectsByKey[key] = EffectClass
            }
        }

        return Object.freeze(effectsByKey)
    }


    return Object.freeze({
        register,
        getEntryForActor,
        getEntryByItemId,
        getAllEntries,
        getRollTableEffectsByType,
        getRollTableEffectsByKey
    })
}
