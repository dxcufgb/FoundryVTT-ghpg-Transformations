import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

export class ItemUsesDTOValidator extends BaseDTOValidator
{
    static rules = {
        max: path("item.system.uses.max").equals(),
        value: path("item.system.uses.value").equals()
    }
}
