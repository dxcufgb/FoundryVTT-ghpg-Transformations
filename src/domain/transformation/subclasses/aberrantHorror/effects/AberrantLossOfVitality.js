import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantLossOfVitality extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [49, 56],
            2: [57, 64],
            3: [65, 79],
            4: [80, 87]
        }
    }
    constructor(args) {
        args?.logger?.debug?.("AberrantLossOfVitality.constructor", { args })
        super(args);
        this.description =
            "Imposes disadvantage on constitution ability checks and saving throws";
    }

    async beforeApply() {
        this.logger?.debug?.("AberrantLossOfVitality.beforeApply", {})
        this.addEffects(
            this.effectChangeBuilder.getDisadvantage(
                this.constants.ABILITY.CONSTITUTION,
                this.constants.ROLL_TYPE.ABILITY_CHECK
            )
        );

        this.addEffects(
            this.effectChangeBuilder.getDisadvantage(
                this.constants.ABILITY.CONSTITUTION,
                this.constants.ROLL_TYPE.SAVING_THROW
            )
        );
    }
}

