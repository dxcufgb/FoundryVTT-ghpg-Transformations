import { RollTableEffect } from "../../../rollTable/RollTableEffect.js";

export class AberrantEffect extends RollTableEffect {
    constructor(args) {
        super(args);
        this.iconSuffix = "Unstable_Form.png";
        this.addFlag("removeOnLongRest", true)
    }

    getIconPath() {
        return super.getIconPath() + "Aberrant%20Horror/" + this.iconSuffix;
    }
}