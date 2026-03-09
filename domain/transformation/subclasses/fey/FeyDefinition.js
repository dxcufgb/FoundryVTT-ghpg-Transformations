import { TransformationDefinition } from "../../TransformationDefinition.js"
import { feyStages } from "./stages/feyStages.js"
import { feyTriggers } from "./triggers/feyTriggers.js"

export class FeyDefinition extends TransformationDefinition
{

    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("FeyDefinition.constructor", { uuid, item })
        super({
            id: "fey",
            label: "Fey",
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
        this.logger?.debug?.("FeyDefinition.#defineStages", {})
        this.stages = feyStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("FeyDefinition.#defineTriggers", {})
        this.triggers = feyTriggers
    }
}
