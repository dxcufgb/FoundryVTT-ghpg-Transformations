import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class TargetDTOValidator extends BaseDTOValidator
{
    static rules = {
        override: path("activity.target.override").equals(),
        prompt: path("activity.target.prompt").equals()
    }
}
