import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

export class HitDieDTOValidator extends BaseDTOValidator
{
    static rules = {
        classes: path("actor.system.attributes.hd.classes").equalsArray(),
        sizes: path("actor.system.attributes.hd.sizes").equalsArray(),
        max: path("actor.system.attributes.hd.max").equals(),
        value: path("actor.system.attributes.hd.value").equals(),
        largest: path("actor.system.attributes.hd.largest").equals(),
        largestAvailable: path("actor.system.attributes.hd.largestAvailable").equals(),
        smallest: path("actor.system.attributes.hd.smallest").equals(),
        smallestAvailable: path("actor.system.attributes.hd.smallestAvailable").equals()
    }
}
