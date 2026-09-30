import { AberrantEffect } from "../aberrantEffect.js"

export class AberrantSlowness extends AberrantEffect
{
    static meta = {
        name: "Aberrant Slowness",
        rollRanges: {
            1: [11, 15],
            2: [7, 24],
            3: [25, 32],
            4: [33, 40]
        }
    }
    constructor (args)
    {
        args?.logger?.debug?.("AberrantSlowness.constructor", { args })
        super(args)
        this.description =
            "Your Speed (all modes) decreases by 15 feet and cannot be increased"
    }

    async beforeApply()
    {
        this.logger?.debug?.("AberrantSlowness.beforeApply", {})
        this.addEffects({
            key: "system.attributes.movement.bonus",
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: -15
        })
    }
}


