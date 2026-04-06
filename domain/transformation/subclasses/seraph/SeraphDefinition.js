import { TransformationDefinition } from "../../TransformationDefinition.js"
import { seraphStages } from "./stages/seraphStages.js"
import { seraphTriggers } from "./triggers/seraphTriggers.js"

export class SeraphDefinition extends TransformationDefinition
{
    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("SeraphDefinition.constructor", { uuid, item })
        super({
            id: "seraph",
            label: "Seraph",
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
        this.logger?.debug?.("SeraphDefinition.#defineStages", {})
        this.stages = seraphStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("SeraphDefinition.#defineTriggers", {})
        this.triggers = seraphTriggers
    }
}
