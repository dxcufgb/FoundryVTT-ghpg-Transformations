import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantExhaustion extends AberrantEffect {
    static meta = {
        name: "Aberrant Exhaustion",
        rollRanges: {
            1: [1, 5],
            2: [2, 3],
            3: [4, 6],
            4: [7, 24]
        }
    }

    constructor(args) {
        args?.logger?.debug?.("AberrantExhaustion.constructor", {args})
        super(args);
        this.description =
            "Your body's metabolism quickly drains your energy. You gain 2 Exhaustion levels.";
    }

    async beforeApply() {
        this.logger?.debug?.("AberrantExhaustion.beforeApply", {})
        this.actorRepository.addExhaustionLevels(this.actor, 2);
        this.runActiveEffect = false;
    }
}

