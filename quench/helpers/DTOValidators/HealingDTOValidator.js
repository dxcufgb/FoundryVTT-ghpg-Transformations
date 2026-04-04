import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class HealingDTOValidator extends BaseDTOValidator
{
    static rules = {
        custom: path("healing.custom.formula").equals(),
        customEnabled: path("healing.custom.enabled").equals(),
        bonus: path("healing.bonus").equals(),
        roll: resolve(ctx =>
        {
            const number = ctx.healing?.number
            const denomination = ctx.healing?.denomination

            if (number == null || denomination == null)
                return null

            return `${number}d${String(denomination).replace(/^d/i, "")}`
        }).equals(),
        scalingNumber: path("healing.scaling.number").equals(),
        types: path("healing.types").includesAll(),
        numberOfTypes: resolve(ctx =>
            Array.isArray(ctx.healing?.types)
                ? ctx.healing.types.length
                : (ctx.healing?.types?.size ?? 0)
        ).equals()
    }

    validate(dtoOrHealing, dtoOrContext = null)
    {
        const isNestedContext =
                  dtoOrContext != null &&
                  typeof dtoOrContext === "object" &&
                  "activity" in dtoOrContext

        const dto = isNestedContext ? dtoOrHealing : dtoOrContext
        const healing = isNestedContext
            ? dtoOrContext.activity?.healing
            : dtoOrHealing

        if (!healing) {
            throw new Error(`[${this.path}] Missing healing`)
        }

        super.validate(this.buildValidationDTO(dto), {healing})

        return true
    }
}
