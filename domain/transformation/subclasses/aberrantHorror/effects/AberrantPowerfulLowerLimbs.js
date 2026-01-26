import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantPowerfullLowerLimbs extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [80, 87],
            2: [88, 93],
            3: [94, 100]
        }
    }
    constructor(args) {
        super(args);
        this.description =
            "Your lower limbs become more powerful. Your Speed increases by 5 feet";
    }

    async beforeApply() {
        const effects = this.actorRepository.setMovementBonus(this.actor, 5);
        this.addEffects(effects);
    }
}