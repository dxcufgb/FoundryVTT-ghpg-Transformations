import { TransformationDefinition } from "../../TransformationDefinition.js"
import { shadowsteelGhoulStages } from "./stages/shadowsteelGhoulStages.js"
import { shadowsteelGhoulTriggers } from "./triggers/shadowsteelGhoulTriggers.js"

export class ShadowsteelGhoulDefinition extends TransformationDefinition
{
    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("ShadowsteelGhoulDefinition.constructor", { uuid, item })
        super({
            id: "shadowsteelGhoul",
            label: "Shadowsteel Ghoul",
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
        this.logger?.debug?.("ShadowsteelGhoulDefinition.#defineStages", {})
        this.stages = shadowsteelGhoulStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("ShadowsteelGhoulDefinition.#defineTriggers", {})
        this.triggers = shadowsteelGhoulTriggers
    }
}
