export class RollTableEffect {
    static meta = {
        name: "",
        rollRanges: {}
    };

    constructor({ actor }) {
        this.actor = actor;
        this.effects = [];
        this.description = "";
        this.runActiveEffect = true;
    }

    async apply() {
        await this.beforeApply();

        if (this.runActiveEffect) {
            await TransformationModule.utils.createActiveEffectOnActor(
                this.actor,
                this.constructor.meta.name,
                this.description,
                this.getIconPath(),
                this.effects
            );
        }

        await this.afterApply();
    }

    async beforeApply() { }
    async afterApply() { }

    getIconPath() {
        return "";
    }

    addEffects(effects) {
        this.effects = this.effects.concat(effects);
    }
}
