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
        await super.beforeApply();
        // The levels last until the next Long Rest: record how many were actually added
        // (exhaustion caps at 6) on the marker effect so the long-rest cleanup can take them back.
        const current = Number(this.actor.system?.attributes?.exhaustion) || 0;
        const added = Math.min(2, Math.max(6 - current, 0));
        await this.actorRepository.addExhaustionLevels(this.actor, 2);
        this.addFlag("exhaustionAdded", added);
    }
}

