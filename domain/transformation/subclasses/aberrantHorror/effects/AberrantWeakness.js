import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantWeakness extends AberrantEffect {
    static meta = {
        rollRanges: {
            3: [1, 1],
            4: [3, 4]
        }
    }

    constructor(args) {
        super(args);
        this.description =
            "Your form becomes fragile. Your Hit Point Maximum is half your normal maximum";
    }

    async beforeApply() {
        const newMax = this.actor.system.attributes.hp.max / 2;

        this.addEffects(
            this.effectChangeBuilder.getSystemEffectChange(
                this.constants.ATTRIBUTE.HEALT_POINTS_MAX,
                newMax,
                CONST.ACTIVE_EFFECT_MODES.OVERRIDE
            )
        );
    }
}