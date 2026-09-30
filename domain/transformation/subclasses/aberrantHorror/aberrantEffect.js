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
        const previous = this.activeEffectRepository.findByOrigin(this.actor, this.origin)
        await this.revertAddedExhaustion(previous)
        await this.activeEffectRepository.removeByOrigin(this.actor, this.origin)
    }

    /**
     * Unstable Form results last until the next Long Rest, so exhaustion levels an
     * earlier result added are taken back when that result is replaced.
     */
    async revertAddedExhaustion(effect)
    {
        this.logger?.debug?.("AberrantEffect.revertAddedExhaustion", { effect })
        const added = Number(effect?.flags?.transformations?.exhaustionAdded) || 0
        if (added <= 0) return

        await this.actorRepository.removeExhaustion(this.actor, added)
    }
}
