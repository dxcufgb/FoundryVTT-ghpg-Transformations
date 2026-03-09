import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class RangeDTOValidator extends BaseDTOValidator
{
    static rules = {
        override: path("activity.range.override").equals(),
        scalar: path("activity.range.scalar").equals(),
        special: path("activity.range.special").equals(),
        units: path("activity.range.units").equals(),
        value: path("activity.range.value").equals()
    }
}
