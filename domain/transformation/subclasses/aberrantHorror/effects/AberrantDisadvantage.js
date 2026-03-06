import { disadvantageOnAllD20RollsEffectChanges } from "../../../../../config/disadvantageOnAllD20Rolls.js"
import { AberrantEffect } from "../aberrantEffect.js"

export class AberrantDisadvantage extends AberrantEffect
{
    static meta = {
        name: "Aberrant Disadvantage",
        rollRanges: {
            2: [1, 1],
            3: [2, 3],
            4: [5, 6]
        }
    }

    constructor (args)
    {
        args?.logger?.debug?.("AberrantDisadvantage.constructor", { args })
        super(args)
        this.description =
            "Your body starts to lose cohesion. You have Disadvantage on all D20 Tests."
    }

    async beforeApply()
    {
        this.logger?.debug?.("AberrantDisadvantage.beforeApply", {})
        this.effects = disadvantageOnAllD20RollsEffectChanges
        // Object.values(this.constants.ABILITY).forEach(ability =>
        // {
        //     this.addEffects(
        //         this.effectChangeBuilder.getDisadvantage(ability)
        //     )
        //     this.addEffects(
        //         this.effectChangeBuilder.getDisadvantage(ability, this.constants.ROLL_TYPE.SAVING_THROW)
        //     )
        // })

        // Object.values(this.constants.ATTRIBUTE.ROLLABLE).forEach(attr =>
        // {
        //     this.addEffects(
        //         this.effectChangeBuilder.getDisadvantage(attr)
        //     )
        //     this.addEffects(
        //         this.effectChangeBuilder.getDisadvantage(attr, this.constants.ROLL_TYPE.SAVING_THROW)
        //     )
        // })
        // Object.values(this.constants.SKILL).forEach(skill =>
        // {
        //     this.addEffects(
        //         this.effectChangeBuilder.getDisadvantage(skill)
        //     )
        // })
    }
}

