import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantLossOfVitality extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [49, 56],
            2: [57, 64],
            3: [65, 79],
            4: [80, 87]
        }
    }
    constructor(args) {
        super(args);
        this.description =
            "Imposes disadvantage on constitution ability checks and saving throws";
    }
}