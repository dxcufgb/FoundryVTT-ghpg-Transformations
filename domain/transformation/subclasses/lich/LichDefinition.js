import { TransformationDefinition } from "../../TransformationDefinition.js"
import { lichStages } from "./stages/lichStages.js"
import { lichTriggers } from "./triggers/lichTriggers.js"

export class LichDefinition extends TransformationDefinition
{
    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("LichDefinition.constructor", { uuid, item })
        super({
            id: "lich",
            label: "Lich",
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
        this.logger?.debug?.("LichDefinition.#defineStages", {})
        this.stages = lichStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("LichDefinition.#defineTriggers", {})
        this.triggers = lichTriggers
    }
}
