import { AberrantEffect } from "../aberrantEffect.js"

export class AberrantWeakness extends AberrantEffect
{
    static meta = {
        name: "Aberrant Weakness",
        rollRanges: {
            3: [1, 1],
            4: [3, 4]
        }
    }

    constructor (args)
    {
        args?.logger?.debug?.("AberrantWeakness.constructor", { args })
        super(args)
        this.description =
            "Your form becomes fragile. Your Hit Point Maximum is half your normal maximum"
    }

    async beforeApply()
    {
        this.logger?.debug?.("AberrantWeakness.beforeApply", {})
        const newMax = Math.ceil(this.actor.system.attributes.hp.max / 2)
        const newActorHp = this.actor.system.attributes.hp.max - newMax
        this.actor.system.attributes.hp.value = newActorHp
        this.addEffects(
            {
                key: "system.attributes.hp.tempmax",
                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                value: -(newMax)
            },
        )
    }
}

