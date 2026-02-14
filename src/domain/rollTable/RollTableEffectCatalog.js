// domain/rolltables/RollTableEffectCatalog.js

export class RollTableEffectCatalog
{
    constructor ({ effectsByKey, logger = null })
    {
        logger?.debug?.("RollTableEffectCatalog.constructor", { effectsByKey })
        this.effectsByKey = effectsByKey
        this.logger = logger
    }

    createInstance({
        effectKey,
        logger = this.logger,
        effectChangeBuilder,
        activeEffectRepository,
        chatService,
        actorRepository,
        constants,
        actor,
        stringUtils,
        moduleFolderPath
    })
    {
        this.logger?.debug?.("RollTableEffectCatalog.createInstance", {
            effectKey,
            effectChangeBuilder,
            activeEffectRepository,
            chatService,
            actorRepository,
            constants,
            actor,
            stringUtils,
            moduleFolderPath
        })
        const EffectClass = this.effectsByKey[effectKey]
        if (!EffectClass) return null

        return new EffectClass({
            actor,
            logger,
            constants,
            activeEffectRepository,
            effectChangeBuilder,
            chatService,
            actorRepository,
            stringUtils,
            moduleFolderPath
        })
    }
}
