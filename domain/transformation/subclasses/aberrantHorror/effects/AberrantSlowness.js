import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantSlowness extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [11, 15],
            2: [7, 24],
            3: [25, 32],
            4: [33, 40]
        }
    }
    constructor(args) {
        super(args);
        this.description =
            "After rolling Initiative, you have the Stunned condition until the end of your first turn";
    }

    async beforeApply() {
        Object.values(TransformationModule.constants.MOVEMENT_TYPE).forEach(type => {
            if (this.actor.system.attributes.movement[type] > 0) {
                this.addEffects(
                    TransformationModule.utils.getSystemEffectChange(
                        type,
                        -15,
                        CONST.ACTIVE_EFFECT_MODES.ADD
                    )
                );
            }
        });
    }
}
