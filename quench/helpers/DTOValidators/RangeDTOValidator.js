import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class RangeDTOValidator extends BaseDTOValidator
{
    static rules = {
        long: path("range.long").equals(),
        override: path("range.override").equals(),
        reach: path("range.reach").equals(),
        scalar: path("range.scalar").equals(),
        special: path("range.special").equals(),
        units: path("range.units").equals(),
        value: path("range.value").equals()
    }

    validate(dtoOrRange, dtoOrContext = null)
    {
        const isNestedContext =
            dtoOrContext != null &&
            typeof dtoOrContext === "object" &&
            (
                "activity" in dtoOrContext ||
                "item" in dtoOrContext
            )

        const dto = isNestedContext ? dtoOrRange : dtoOrContext
        const range = isNestedContext
            ? (
                dtoOrContext.activity?.range ??
                dtoOrContext.item?.system?.range ??
                dtoOrContext.item?.range
            )
            : dtoOrRange

        if (!range)
            throw new Error(`[${this.path}] Missing range`)

        super.validate(this.buildValidationDTO(dto), { range })
        return true
    }
}
