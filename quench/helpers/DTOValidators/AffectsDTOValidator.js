import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class AffectsDTOValidator extends BaseDTOValidator
{
    static rules = {
        choice: path("activity.target.affects.choice").equals(),
        count: path("activity.target.affects.count").equals(),
        scalar: path("activity.target.affects.scalar").equals(),
        special: path("activity.target.affects.special").equals(),
        type: path("activity.target.affects.type").equals()
    }
}
