import { AberrantEffect } from "../aberrantEffect.js";

export class AberrantSlowSpeech extends AberrantEffect {
    static meta = {
        rollRanges: {
            1: [57, 64],
            2: [65, 79],
            3: [80, 87],
            4: [88, 93]
        }
    }
    constructor(args) {
        args?.logger?.debug?.("AberrantSlowSpeech.constructor", { args })
        super(args);
        this.description =
            "Speaking is difficult. You can only utter one word during each turn. This does not hamper spellcasting";
    }
}

