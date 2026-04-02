import { RollTableEffect } from "../../../rollTable/RollTableEffect.js"

export class AberrantEffect extends RollTableEffect
{
    constructor(args)
    {
        args?.logger?.debug?.("AberrantEffect.constructor", {args})
        super(args)
        this.iconSuffix = "Unstable_Form.png"
        this.addFlag("removeOnLongRest", true)
        this.origin = "Unstable Form"
    }

    getIconPath()
    {
        this.logger?.debug?.("AberrantEffect.getIconPath", {})
        return super.getIconPath() + "Aberrant%20Horror/" + this.iconSuffix
    }

    async beforeApply()
    {
        await super.beforeApply()
        this.logger?.debug?.("AberrantEffect.beforeApply", {})
        await this.activeEffectRepository.removeByOrigin(this.actor, this.origin)
    }
}
