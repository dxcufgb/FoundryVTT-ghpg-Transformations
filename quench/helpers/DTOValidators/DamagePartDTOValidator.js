import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class DamagePartDTOValidator extends BaseDTOValidator
{
    static rules = {

        custom: path("part.custom.formula").equals(),
        customEnabled: path("part.custom.enabled").equals(),
        bonus: path("part.bonus").equals(),
        roll: resolve(ctx =>
        {
            const number = ctx.part.number
            const denomination = ctx.part.denomination

            if (number == null || denomination == null)
                return null

            return `${number}d${String(denomination).replace(/^d/i, "")}`
        }
        ).equals(),
        scalingNumber: path("part.scaling.number").equals(),
        damageTypes: path("part.types").includesAll(),
        numberOfTypes: resolve(ctx =>
            Array.isArray(ctx.part.types)
                ? ctx.part.types.length
                : (ctx.part.types?.size ?? 0)
        ).equals()
    }

    validate(part, dto)
    {
        if (!part)
            throw new Error(`[${this.path}] Missing damage part`)

        super.validate(this.buildValidationDTO(dto), {part})

        return true
    }
}
