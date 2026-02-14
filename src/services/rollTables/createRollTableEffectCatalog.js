// services/rolltables/createRollTableEffectCatalog.js

import { RollTableEffectCatalog } from "../../domain/rollTable/RollTableEffectCatalog.js"

export function createRollTableEffectCatalog({
    transformationRegistry,
    constants,
    effectChangeBuilder,
    chatService,
    actorRepository,
    logger
})
{
    const effectsByKey = {}

    for (const entry of transformationRegistry.getAllEntries()) {
        const effects = entry.TransformationRollTableEffects
        if (!effects) continue

        for (const [key, EffectClass] of Object.entries(effects)) {
            if (effectsByKey[key]) {
                logger.warn(
                    "Duplicate roll table effect key",
                    key
                )
                continue
            }
            effectsByKey[key] = EffectClass
        }
    }

    return Object.freeze(
        new RollTableEffectCatalog({
            effectsByKey,
            constants,
            effectChangeBuilder,
            chatService,
            actorRepository
        })
    )
}
