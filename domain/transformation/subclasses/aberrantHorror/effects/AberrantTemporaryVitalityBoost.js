import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantTemporaryVitalityBoost extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [88, 93],
            2: [94, 100]
        }
    }
    async beforeApply() {
        const currentTempHp = this.actor.system.attributes.hp.temp ?? 0;
        const bonus = this.actor.flags.dnd5e.transformationStage * 4;

        await this.actor.update({
            "system.attributes.hp.temp": currentTempHp + bonus
        });

        this.runActiveEffect = false;
    }
}
