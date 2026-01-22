import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantExhaustion extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [1, 5],
            2: [2, 3],
            3: [4, 6],
            4: [7, 24]
        }
    }

    async beforeApply() {
        const current = this.actor.system.attributes.exhaustion ?? 0;
        const value = Math.clamp(current + 2, 0, 6);

        await this.actor.update({
            "system.attributes.exhaustion": value
        });

        this.runActiveEffect = false;
    }
}