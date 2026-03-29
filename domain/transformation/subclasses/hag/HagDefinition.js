import { TransformationDefinition } from "../../TransformationDefinition.js"
import { hagStages } from "./stages/hagStages.js"
import { hagTriggers } from "./triggers/hagTriggers.js"

export class HagDefinition extends TransformationDefinition
{

    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("HagDefinition.constructor", { uuid, item })
        super({
            id: "hag",
            label: "Hag",
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
        this.logger?.debug?.("HagDefinition.#defineStages", {})
        this.stages = hagStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("HagDefinition.#defineTriggers", {})
        this.triggers = hagTriggers
    }
}
