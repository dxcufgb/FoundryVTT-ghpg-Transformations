import { ItemDTOValidator } from "../../DTOValidators/ItemDTOValidator.js"
import { ActivityValidationDTO } from "../activity/ActivityValidationDTO.js"
import { EffectValidationDTO } from "../effect/EffectValidationDTO.js"

// @ts-check
export class ItemValidationDTO
{
    static validator = ItemDTOValidator

    constructor ()
    {
        this.itemName = null
        this.expectedItemUuids = []

        this.type = null
        this.usesLeft = null

        this.activities = [] // ActivityValidationDTO[]
        this.effects = []    // EffectValidationDTO[]
    }

    addActivity(configure)
    {
        const dto = new ActivityValidationDTO()
        configure(dto)
        this.activities.push(dto)
        return this
    }

    addEffect(configure)
    {
        const dto = new EffectValidationDTO()
        configure(dto)
        this.effects.push(dto)
        return this
    }
}