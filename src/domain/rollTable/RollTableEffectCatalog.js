// domain/rolltables/RollTableEffectCatalog.js

export class RollTableEffectCatalog {
    constructor({ effectsByKey }) {
        this.effectsByKey = effectsByKey;
    }

    createInstance({
        effectKey,
        effectChangeBuilder,
        activeEffectRepository,
        chatService,
        actorRepository,
        constants,
        actor,
        stringUtils,
        moduleFolderPath
    }) {
        const EffectClass = this.effectsByKey[effectKey];
        if (!EffectClass) return null;

        return new EffectClass({
            actor,
            constants,
            activeEffectRepository,
            effectChangeBuilder,
            chatService,
            actorRepository,
            stringUtils,
            moduleFolderPath
        });
    }
}
