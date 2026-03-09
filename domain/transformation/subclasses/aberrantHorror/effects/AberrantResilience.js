import { AberrantEffect } from "../aberrantEffect.js"

export class AberrantResilience extends AberrantEffect
{
    static _meta = {
        name: "Aberrant Resilience",
        rollRanges: {
            1: [94, 100]
        }
    }
    constructor (args)
    {
        args?.logger?.debug?.("AberrantResilience.constructor", { args })
        super(args)
        this.description =
            "Your body's systems are enhanced. You have Advantage on Death Saving Throws"
    }

    async beforeApply()
    {
        this.logger?.debug?.("AberrantResilience.beforeApply", {})
        this.addEffects([{
            key: "system.attributes.death.roll.mode",
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
            value: true
        }])
    }
}


