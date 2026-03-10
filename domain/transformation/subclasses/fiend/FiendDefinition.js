import { TransformationDefinition } from "../../TransformationDefinition.js"
import { fiendStages } from "./stages/fiendStages.js"
import { fiendTriggers } from "./triggers/fiendTriggers.js"

export class FiendDefinition extends TransformationDefinition
{

    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("fiendDefinition.constructor", { uuid, item })
        super({
            id: "fiend",
            label: "fiend",
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
        this.logger?.debug?.("fiendDefinition.#defineStages", {})
        this.stages = fiendStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("fiendDefinition.#defineTriggers", {})
        this.triggers = fiendTriggers
    }
}
