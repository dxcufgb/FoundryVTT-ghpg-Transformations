import { AberrantEffect } from "../aberrantEffect.js"

export class AberrantTemporaryVitalityBoost extends AberrantEffect
{
    static meta = {
        name: "Aberrant Temporary Vitality Boost",
        rollRanges: {
            1: [88, 93],
            2: [94, 100]
        }
    }

    constructor(args) {
        args?.logger?.debug?.("AberrantTemporaryVitalityBoost.constructor", { args })
        super(args)
        this.description =
            "Your flesh becomes more hardy. You start the day with 4 Temporary Hit Points per Transformation Stage."
    }

    async beforeApply() {
        this.logger?.debug?.("AberrantTemporaryVitalityBoost.beforeApply", {})
        const bonus = this.actor.flags.transformations.stage * 4
        await this.actorRepository.setActorHp(this.actor, bonus, "temp")
        this.runActiveEffect = false
    }
}


