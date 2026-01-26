import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantTemporaryVitalityBoost extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [88, 93],
            2: [94, 100]
        }
    }

    constructor(args) {
        super(args);
        this.description =
            "Your flesh becomes more hardy. You start the day with 4 Temporary Hit Points per Transformation Stage.";
    }

    async beforeApply() {
        const bonus = this.actor.flags.dnd5e.transformationStage * 4;
        await this.actorRepository.setActorHp(this.actor, bonus, "temp");
        this.runActiveEffect = false;
    }
}
