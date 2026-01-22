import { RollTableEffect } from "../../../rollTable/RollTableEffect.js";

export class AberrantEffect extends RollTableEffect {
    constructor(args) {
        super(args);
        this.iconSuffix = "Unstable_Form.png";
    }

    getIconPath() {
        return this.iconBaseFilePath + this.iconSuffix;
    }
}