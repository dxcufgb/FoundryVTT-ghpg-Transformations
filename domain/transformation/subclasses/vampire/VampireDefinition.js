import { TransformationDefinition } from "../../TransformationDefinition.js"
import { vampireStages } from "./stages/vampireStages.js"
import { vampireTriggers } from "./triggers/vampireTriggers.js"

export class VampireDefinition extends TransformationDefinition
{
    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("VampireDefinition.constructor", { uuid, item })
        super({
            id: "vampire",
            label: "Vampire",
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
        this.logger?.debug?.("VampireDefinition.#defineStages", {})
        this.stages = vampireStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("VampireDefinition.#defineTriggers", {})
        this.triggers = vampireTriggers
    }
}
