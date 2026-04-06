import { TransformationDefinition } from "../../TransformationDefinition.js"
import { specterStages } from "./stages/specterStages.js"
import { specterTriggers } from "./triggers/specterTriggers.js"

export class SpecterDefinition extends TransformationDefinition
{
    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("SpecterDefinition.constructor", { uuid, item })
        super({
            id: "specter",
            label: "Specter",
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
        this.logger?.debug?.("SpecterDefinition.#defineStages", {})
        this.stages = specterStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("SpecterDefinition.#defineTriggers", {})
        this.triggers = specterTriggers
    }
}
