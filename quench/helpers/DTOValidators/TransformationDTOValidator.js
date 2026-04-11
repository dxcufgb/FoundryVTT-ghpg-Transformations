import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class TransformationDTOValidator extends BaseDTOValidator
{
    static rules = {
        customize: path("activity.transform.customize").equals(),
        mode: path("activity.transform.mode").equals(),
        preset: path("activity.transform.preset").equals()
    }
}
