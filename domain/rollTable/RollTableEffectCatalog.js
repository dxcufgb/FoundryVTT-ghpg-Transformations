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
        const EffectClass = this.resolveEffectClass(effectKey)
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

    // Effect keys are derived from roll table result names, whose casing does not always match
    // the class names (e.g. "Aberrant Loss of Vitality" -> "AberrantLossofVitality"), so fall back
    // to a case and punctuation insensitive match.
    resolveEffectClass(effectKey)
    {
        if (typeof effectKey !== "string" || !effectKey) return null

        const exact = this.effectsByKey?.[effectKey]
        if (exact) return exact

        const normalizedKey = normalizeEffectKey(effectKey)

        for (const [key, EffectClass] of Object.entries(this.effectsByKey ?? {})) {
            if (normalizeEffectKey(key) === normalizedKey) return EffectClass

            const metaName = EffectClass?.meta?.name
            if (metaName && normalizeEffectKey(metaName) === normalizedKey) return EffectClass
        }

        return null
    }
}

function normalizeEffectKey(value)
{
    return String(value).toLowerCase().replace(/[^a-z0-9]/g, "")
}
