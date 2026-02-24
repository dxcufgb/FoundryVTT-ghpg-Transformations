import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantDefenseless extends AberrantEffect {
    static meta = {
        name: "Aberrant Defenseless",
        rollRanges: {
            1: [33, 40],
            2: [41, 48],
            3: [49, 56],
            4: [57, 64]
        }
    }
    constructor(args) {
        args?.logger?.debug?.("AberrantDefenseless.constructor", { args })
        super(args);
        this.description =
            "Imposes disadvantage on constitution saving throws";
    }

    async beforeApply() {
        this.logger?.debug?.("AberrantDefenseless.beforeApply", {})
        this.addEffects(
            this.effectChangeBuilder.getDisadvantage(
                this.constants.ABILITY.CONSTITUTION,
                this.constants.ROLL_TYPE.SAVING_THROW
            )
        );
    }
}

