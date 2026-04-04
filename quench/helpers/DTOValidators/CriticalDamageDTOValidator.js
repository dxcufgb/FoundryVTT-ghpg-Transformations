import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class CriticalDamageDTOValidator extends BaseDTOValidator
{
    static rules = {
        allow: path("critical.allow").equals(),
        bonus: path("critical.bonus").equals()
    }

    validate(dtoOrCritical, dtoOrContext = null)
    {
        const isNestedContext =
            dtoOrContext != null &&
            typeof dtoOrContext === "object" &&
            "activity" in dtoOrContext

        const dto = isNestedContext ? dtoOrCritical : dtoOrContext
        const critical = isNestedContext
            ? dtoOrContext.activity?.damage?.critical
            : dtoOrCritical

        if (!critical) {
            throw new Error(`[${this.path}] Missing critical damage`)
        }

        super.validate(this.buildValidationDTO(dto), { critical })

        return true
    }
}
