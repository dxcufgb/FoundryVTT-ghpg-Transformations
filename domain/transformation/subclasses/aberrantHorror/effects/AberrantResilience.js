import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantResilience extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [94, 100]
        }
    }
    constructor(args) {
        args?.logger?.debug?.("AberrantResilience.constructor", { args })
        super(args);
        this.description =
            "Your bodyâ€™s systems are enhanced. You have Advantage on Death Saving Throws";
    }

    async beforeApply() {
        this.logger?.debug?.("AberrantResilience.beforeApply", {})
        this.addEffects([{
            key: "flags.midi-qol.advantage.deathSave",
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: true
        }]);
    }
}


