import { TransformationDefinition } from "../../TransformationDefinition.js"
import { primordialStages } from "./stages/primordialStages.js"
import { primordialTriggers } from "./triggers/primordialTriggers.js"

export class PrimordialDefinition extends TransformationDefinition
{
    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("PrimordialDefinition.constructor", { uuid, item })
        super({
            id: "primordial",
            label: "Primordial",
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
        this.logger?.debug?.("PrimordialDefinition.#defineStages", {})
        this.stages = primordialStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("PrimordialDefinition.#defineTriggers", {})
        this.triggers = primordialTriggers
    }
}
