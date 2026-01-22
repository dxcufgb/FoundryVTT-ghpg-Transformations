import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantPowerfulLowerLimbs extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [80, 87],
            2: [88, 93],
            3: [94, 100]
        }
    }
    constructor(args) {
        super(args);
        this.description =
            "Your lower limbs become more powerful. Your Speed increases by 5 feet";
    }

    async beforeApply() {
        Object.values(TransformationModule.constants.MOVEMENT_TYPE).forEach(type => {
            if (this.actor.system.attributes.movement[type] > 0) {
                this.addEffects(
                    TransformationModule.utils.getSystemEffectChange(
                        type,
                        5,
                        CONST.ACTIVE_EFFECT_MODES.ADD
                    )
                );
            }
        });
    }
}