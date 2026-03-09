import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

export class ActivityDurationDTOValidator extends BaseDTOValidator
{
    static rules = {
        concentration: path("activity.duration.concentration").equals(),
        override: path("activity.duration.override").equals(),
        scalar: path("activity.duration.scalar").equals(),
        special: path("activity.duration.special").equals(),
        units: path("activity.duration.units").equals(),
        value: path("activity.duration.value").equals()
    }
}