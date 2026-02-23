import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantNoEffect extends AberrantEffect {
    static meta = {
        name: "Aberrant No Effect",
        rollRanges: {
            1: [65, 79],
            2: [80, 87],
            3: [88, 93],
            4: [94, 100]
        }
    }
    constructor(args) {
        args?.logger?.debug?.("AberrantNoEffect.constructor", { args })
        super(args);
        this.description =
            "No effect";
    }

    async beforeApply() {
        this.logger?.debug?.("AberrantNoEffect.beforeApply", {})
        this.runActiveEffect = false;
    }
}

