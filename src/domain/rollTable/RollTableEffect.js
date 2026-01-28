export class RollTableEffect {
    static get meta() {
        // Ensure meta always exists
        const meta = this._meta ?? {};

        // Default key.name → class name
        meta.key ??= {};
        meta.key.name ??= this.name;

        return meta;
    }

    // Allow subclasses to define partial meta
    static set meta(value) {
        this._meta = value;
    }

    constructor({
        actor,
        effectChangeBuilder,
        activeEffectRepository,
        actorRepository,
        constants,
        chatService,
        stringUtils,
        moduleFolderPath
    }) {
        this.actor = actor;
        this.effects = [];
        this.flags = { transformations: {} };
        this.description = "";
        this.runActiveEffect = true;
        this.effectChangeBuilder = effectChangeBuilder;
        this.constants = constants;
        this.actorRepository = actorRepository;
        this.chatService = chatService;
        this.activeEffectRepository = activeEffectRepository;
        this.stringUtils = stringUtils;
        this.moduleFolderPath = moduleFolderPath;
    }

    async apply() {
        await this.beforeApply();

        if (this.runActiveEffect) {
            await this.activeEffectRepository.create({
                actor: this.actor,
                name: this.stringUtils.humanizeClassName(this.constructor.name),
                description: this.description,
                icon: this.getIconPath(),
                changes: this.effects,
                flags: this.flags
            });
        }

        await this.afterApply();
    }

    async beforeApply() { }
    async afterApply() { }

    getIconPath() {
        return this.moduleFolderPath;
    }

    addEffects(effects) {
        this.effects = this.effects.concat(effects);
    }

    addFlag(flagName, value) {
        this.flags.transformations[flagName] = value;
    }

    async postChat({ content, flavor = null, whisper = null }) {
        if (!this.chatService) return;

        await this.chatService.post({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content,
            flavor,
            whisper
        });
    }
}
