import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantDefenseless extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [33, 40],
            2: [41, 48],
            3: [49, 56],
            4: [57, 64]
        }
    }
    constructor(args) {
        super(args);
        this.description =
            "Imposes disadvantage on constitution saving throws";
    }

    async beforeApply() {
        this.addEffects(
            TransformationModule.utils.getDisadvantageEffectChanges(
                TransformationModule.constants.ABILITY.CONSTITUTION,
                TransformationModule.constants.ROLL_TYPE.SAVING_THROW
            )
        );
    }
}