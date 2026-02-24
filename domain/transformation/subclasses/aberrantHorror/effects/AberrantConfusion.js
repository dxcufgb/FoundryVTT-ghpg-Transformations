import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantConfusion extends AberrantEffect {
    static meta = {
        name: "Aberrant Confusion",
        rollRanges: {
            1: [6, 10],
            2: [4, 6],
            3: [7, 24],
            4: [25, 32]
        }
    }

    constructor(args) {
        args?.logger?.debug?.("AberrantConfusion.constructor", { args })
        super(args);
        this.description =
            "After rolling Initiative, you have the Stunned condition until the end of your first turn";
    }
}

