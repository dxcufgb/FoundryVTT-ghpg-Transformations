import { TransformationDefinition } from "../../TransformationDefinition.js"
import { oozeStages } from "./stages/oozeStages.js"
import { oozeTriggers } from "./triggers/oozeTriggers.js"

export class OozeDefinition extends TransformationDefinition
{
    constructor ({ uuid, item, logger = null })
    {
        logger?.debug?.("OozeDefinition.constructor", { uuid, item })
        super({
            id: "ooze",
            label: "Ooze",
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
        this.logger?.debug?.("OozeDefinition.#defineStages", {})
        this.stages = oozeStages
    }

    #defineTriggers()
    {
        this.logger?.debug?.("OozeDefinition.#defineTriggers", {})
        this.triggers = oozeTriggers
    }
}
