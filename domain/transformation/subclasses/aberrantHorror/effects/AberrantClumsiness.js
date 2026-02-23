import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantClumsiness extends AberrantEffect {
    static meta = {
        name: "Aberrant Clumsiness",
        rollRanges: {
            1: [41, 48],
            2: [49, 56],
            3: [57, 64],
            4: [65, 79]
        }
    }
    constructor(args) {
        args?.logger?.debug?.("AberrantClumsiness.constructor", { args })
        super(args);
        this.description =
            "You become clumsy. You have Disadvantage on Dexterity saving throws and Dexterity ability checks.";
    }

    async beforeApply() {
        this.logger?.debug?.("AberrantClumsiness.beforeApply", {})
        this.addEffects(
            this.effectChangeBuilder.getDisadvantage(
                this.constants.ABILITY.DEXTERITY,
                this.constants.ROLL_TYPE.ABILITY_CHECK
            )
        );

        this.addEffects(
            this.effectChangeBuilder.getDisadvantage(
                this.constants.ABILITY.DEXTERITY,
                this.constants.ROLL_TYPE.SAVING_THROW
            )
        );
    }
}

