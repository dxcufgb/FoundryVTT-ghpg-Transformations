import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantNoEffect extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [65, 79],
            2: [80, 87],
            3: [88, 93],
            4: [94, 100]
        }
    }
    constructor(args) {
        super(args);
        this.description =
            "No effect";
    }

    async beforeApply() {
        this.runActiveEffect = false;
    }
}