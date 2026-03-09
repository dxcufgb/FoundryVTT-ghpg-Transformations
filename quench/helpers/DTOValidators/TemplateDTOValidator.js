import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class TemplateDTOValidator extends BaseDTOValidator
{
    static rules = {
        contiguous: path("activity.target.template.contiguous").equals(),
        count: path("activity.target.template.count").equals(),
        height: path("activity.target.template.height").equals(),
        size: path("activity.target.template.size").equals(),
        type: path("activity.target.template.type").equals(),
        units: path("activity.target.template.units").equals(),
        width: path("activity.target.template.width").equals()
    }
}
