import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantDisadvantage extends AberrantEffect {
    static meta = {
        rollRanges: {
            2: [1, 1],
            3: [2, 3],
            4: [5, 6]
        }
    }

    constructor(args) {
        super(args);
        this.description =
            "Your body starts to lose cohesion. You have Disadvantage on all D20 Tests.";
    }

    async beforeApply() {
        Object.values(TransformationModule.constants.SKILL).forEach(skill => {
            this.addEffects(
                TransformationModule.utils.getSkillDisadvantageEffectChanges(skill)
            );
        });

        Object.values(TransformationModule.constants.ABILITY).forEach(ability => {
            this.addEffects(
                TransformationModule.utils.getAbilityCheckDisadvantageEffectChanges(ability)
            );
            this.addEffects(
                TransformationModule.utils.getAbilitySaveDisadvantageEffectChanges(ability)
            );
        });

        Object.values(TransformationModule.constants.ATTRIBUTE.ROLLABLE).forEach(attr => {
            this.addEffects(
                TransformationModule.utils.getAttributeCheckDisadvantageEffectChanges(attr)
            );
            this.addEffects(
                TransformationModule.utils.getAttributeSaveDisadvantageEffectChanges(attr)
            );
        });
    }
}