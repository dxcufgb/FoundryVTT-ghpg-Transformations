// services/rolltables/createRollTableEffectResolver.js

export function createRollTableEffectResolver({
    rollTableEffectCatalog,
    activeEffectRepository,
    constants,
    effectChangeBuilder,
    actorRepository,
    chatService,
    stringUtils,
    moduleFolderPath,
    logger
}) {
    logger.debug("createRollTableEffectResolver", {
        rollTableEffectCatalog,
        activeEffectRepository,
        constants,
        effectChangeBuilder,
        actorRepository,
        chatService,
        stringUtils,
        moduleFolderPath
    })

    function resolve({ actor, effectKey }) {
        logger.debug("createRollTableEffectResolver.resolve", { actor, effectKey })
        if (!actor) {
            logger.warn(
                "rollTableEffectResolver.resolve called without actor"
            );
            return null;
        }

        if (!effectKey) {
            logger.debug(
                "No effectKey provided, skipping roll table effect"
            );
            return null;
        }

        const effect = rollTableEffectCatalog.createInstance({
            constants,
            activeEffectRepository,
            effectChangeBuilder,
            chatService,
            actorRepository,
            effectKey,
            actor,
            stringUtils,
            moduleFolderPath
        });

        if (!effect) {
            logger.warn(
                "Unknown roll table effect key",
                effectKey
            );
            return null;
        }

        return effect;
    }

    return Object.freeze({ resolve });
}
