import { RollTableEffect } from "../../../rollTable/RollTableEffect.js";

export class AberrantEffect extends RollTableEffect {
    constructor(args) {
        args?.logger?.debug?.("AberrantEffect.constructor", { args })
        super(args);
        this.iconSuffix = "Unstable_Form.png";
        this.addFlag("removeOnLongRest", true)
    }

    getIconPath() {
        this.logger?.debug?.("AberrantEffect.getIconPath", {})
        return super.getIconPath() + "Aberrant%20Horror/" + this.iconSuffix;
    }
}
