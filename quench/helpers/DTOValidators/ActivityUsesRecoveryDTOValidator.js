import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

export class ActivityUsesRecoveryDTOValidator extends BaseDTOValidator
{
    static rules = {
        period: path("activity.uses.recovery[0].period").equals(),
        type: path("activity.uses.recovery[0].type").equals()
    }
}
