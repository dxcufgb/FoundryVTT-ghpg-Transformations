import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantSlugginess extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [16, 24],
            2: [25, 32],
            3: [33, 40],
            4: [41, 48]
        }
    }
    constructor(args) {
        super(args);
        this.description =
            "Your body does not react quickly to mental commands. You cannot take Reactions.";
    }
}