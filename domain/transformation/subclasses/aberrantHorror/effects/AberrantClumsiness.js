import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantClumsiness extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [41, 48],
            2: [49, 56],
            3: [57, 64],
            4: [65, 79]
        }
    }
    constructor(args) {
        super(args);
        this.description =
            "Imposes disadvantage on constitution ability checks and saving throws";
    }

    async beforeApply() {
        this.addEffects(
            TransformationModule.utils.getDisadvantageEffectChanges(
                TransformationModule.constants.ABILITY.DEXTERITY,
                TransformationModule.constants.ROLL_TYPE.ABILITY_CHECK
            )
        );

        this.addEffects(
            TransformationModule.utils.getDisadvantageEffectChanges(
                TransformationModule.constants.ABILITY.DEXTERITY,
                TransformationModule.constants.ROLL_TYPE.SAVING_THROW
            )
        );
    }
}