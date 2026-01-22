export class RollTableEffect {
    constructor({ actor, name, iconBaseFilePath }) {
        this.actor = actor;
        this.name = name;
        this.iconBaseFilePath = iconBaseFilePath;

        this.description = '';
        this.effects = [];
        this.runActiveEffect = true;
    }

    /* ---------- Lifecycle ---------- */

    async apply() {
        await this.beforeApply();

        if (this.runActiveEffect) {
            await TransformationModule.utils.createActiveEffectOnActor(
                this.actor,
                this.name,
                this.description,
                this.getIconPath(),
                this.effects
            );
        }

        await this.afterApply();
    }

    /* ---------- Hooks (override freely) ---------- */

    async beforeApply() { }
    async afterApply() { }

    /* ---------- Helpers ---------- */

    getIconPath() {
        return this.iconBaseFilePath;
    }

    addEffect(effect) {
        this.effects.push(effect);
    }

    addEffects(effects) {
        this.effects = this.effects.concat(effects);
    }
}
