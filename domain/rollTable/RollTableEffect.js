export class RollTableEffect
{
    static get meta()
    {
        this._logger?.debug?.("RollTableEffect.meta.get", {})
        // Ensure meta always exists
        const meta = this._meta ?? {}

        // Default key.name / class name
        meta.key ??= {}
        meta.key.name ??= this.name

        return meta
    }

    // Allow subclasses to define partial meta
    static set meta(value)
    {
        this._logger?.debug?.("RollTableEffect.meta.set", { value })
        this._meta = value
    }

    get meta()
    {
        return this.constructor.meta
    }

    constructor ({
        actor,
        logger = null,
        effectChangeBuilder,
        activeEffectRepository,
        actorRepository,
        constants,
        chatService,
        stringUtils,
        moduleFolderPath
    })
    {
        logger?.debug?.("RollTableEffect.constructor", {
            actor,
            logger,
            effectChangeBuilder,
            activeEffectRepository,
            actorRepository,
            constants,
            chatService,
            stringUtils,
            moduleFolderPath
        })
        this.actor = actor
        this.effects = []
        this.flags = { transformations: {} }
        this.description = ""
        this.runActiveEffect = true
        this.effectChangeBuilder = effectChangeBuilder
        this.logger = logger
        this.constants = constants
        this.actorRepository = actorRepository
        this.chatService = chatService
        this.activeEffectRepository = activeEffectRepository
        this.stringUtils = stringUtils
        this.moduleFolderPath = moduleFolderPath
        this.origin = ""
    }

    async apply()
    {
        this.logger?.debug?.("RollTableEffect.apply", {})
        await this.beforeApply()

        if (this.runActiveEffect) {
            await this.activeEffectRepository.create({
                actor: this.actor,
                name: this.stringUtils.humanizeClassName(this.constructor.name),
                description: this.description,
                icon: this.getIconPath(),
                changes: this.effects,
                flags: this.flags,
                origin: this.origin
            })
        }

        await this.afterApply()
    }

    async beforeApply()
    {
        this.logger?.debug?.("RollTableEffect.beforeApply", {})
    }
    async afterApply()
    {
        this.logger?.debug?.("RollTableEffect.afterApply", {})
    }

    getIconPath()
    {
        this.logger?.debug?.("RollTableEffect.getIconPath", {})
        return this.moduleFolderPath
    }

    addEffects(effects)
    {
        this.logger?.debug?.("RollTableEffect.addEffects", { effects })
        this.effects = this.effects.concat(effects)
    }

    addFlag(flagName, value)
    {
        this.logger?.debug?.("RollTableEffect.addFlag", { flagName, value })
        this.flags.transformations[flagName] = value
    }

    async postChat({ content, flavor = null, whisper = null })
    {
        this.logger?.debug?.("RollTableEffect.postChat", { content, flavor, whisper })
        if (!this.chatService) return

        await this.chatService.post({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content,
            flavor,
            whisper
        })
    }
}
