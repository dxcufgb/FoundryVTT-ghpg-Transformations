import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class DamagePartDTOValidator extends BaseDTOValidator
{
    static rules = {

        custom: path("part.custom.formula").equals(),
        roll: resolve(ctx =>
            `${ctx.part.number}d${ctx.part.denomination}`
        ).equals(),
        damageTypes: path("part.types").includesAll(),
        numberOfTypes: resolve(ctx =>
            ctx.part.types?.size ?? 0
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
