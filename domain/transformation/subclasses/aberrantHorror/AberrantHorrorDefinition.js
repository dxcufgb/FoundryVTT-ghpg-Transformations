import { TransformationDefinition } from "../../TransformationDefinition.js"
import { aberrantHorrorStages } from "./stages/aberrantHorrorStages.js"
import { aberrantHorrorTriggers } from "./triggers/aberrantHorrorTriggers.js"

export class AberrantHorrorDefinition extends TransformationDefinition
{

    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("AberrantHorrorDefinition.constructor", { uuid, item })
        super({
            id: "aberrant-horror",
            label: "Aberrant Horror",
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
        this.logger?.debug?.("AberrantHorrorDefinition.#defineStages", {})
        this.stages = aberrantHorrorStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("AberrantHorrorDefinition.#defineTriggers", {})
        this.triggers = aberrantHorrorTriggers
    }
}
