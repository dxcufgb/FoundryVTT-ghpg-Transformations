import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantDistraction extends AberrantEffect {
    static meta = {
        name: "Aberrant Distraction",
        rollRanges: {
            1: [25, 32],
            2: [33, 40],
            3: [41, 48],
            4: [49, 56]
        }
    }
    constructor(args) {
        args?.logger?.debug?.("AberrantDistraction.constructor", { args })
        super(args);
        this.description =
            "Imposes disadvantage on dexterity saving throws";
    }

    async beforeApply() {
        this.logger?.debug?.("AberrantDistraction.beforeApply", {})
        this.addEffects(
            this.effectChangeBuilder.getDisadvantage(
                this.constants.SKILL.PERCEPTION,
                this.constants.ROLL_TYPE.SAVING_THROW
            )
        );
    }
}

