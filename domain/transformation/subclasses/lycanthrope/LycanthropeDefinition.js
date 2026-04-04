import { TransformationDefinition } from "../../TransformationDefinition.js"
import { lycanthropeStages } from "./stages/lycanthropeStages.js"
import { lycanthropeTriggers } from "./triggers/lycanthropeTriggers.js"

export class LycanthropeDefinition extends TransformationDefinition
{
    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("LycanthropeDefinition.constructor", { uuid, item })
        super({
            id: "lycanthrope",
            label: "Lycanthrope",
            uuid,
            item,
            logger
        })

        this.#defineStages()
        this.#defineTriggers()

        this.validate()
    }

    #defineStages()
    {
        this.logger?.debug?.("LycanthropeDefinition.#defineStages", {})
        this.stages = lycanthropeStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("LycanthropeDefinition.#defineTriggers", {})
        this.triggers = lycanthropeTriggers
    }
}
