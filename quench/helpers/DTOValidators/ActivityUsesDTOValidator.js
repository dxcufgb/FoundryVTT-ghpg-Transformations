import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

export class ActivityUsesDTOValidator extends BaseDTOValidator
{
    static rules = {
        max: path("activity.uses.max").equals(),
        value: path("activity.uses.value").equals()
    }
}
