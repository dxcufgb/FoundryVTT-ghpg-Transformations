import { AberrantEffect } from "../aberrantEffect.js"

export class AberrantPowerfullLowerLimbs extends AberrantEffect
{
    static meta = {
        name: "Aberrant Powerful Lower Limbs",
        rollRanges: {
            1: [80, 87],
            2: [88, 93],
            3: [94, 100]
        }
    }

    constructor(args)
    {
        args?.logger?.debug?.("AberrantPowerfulLowerLimbs.constructor", {args})
        super(args)
        this.description =
            "Your lower limbs become more powerful. Your Speed increases by 5 feet"
    }

    async beforeApply()
    {
        this.logger?.debug?.("AberrantPowerfulLowerLimbs.beforeApply", {})
        this.addEffects({
            key: "system.attributes.movement.bonus",
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: 5
        })
    }
}

