import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

export class ItemUsesRecoveryDTOValidator extends BaseDTOValidator
{
    static rules = {
        period: path("item.system.uses.recovery[0].period").equals(),
        type: path("item.system.uses.recovery[0].type").equals()
    }
}
