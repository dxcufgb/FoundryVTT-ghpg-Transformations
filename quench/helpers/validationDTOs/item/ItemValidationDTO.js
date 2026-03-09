import { ItemDTOValidator } from "../../DTOValidators/ItemDTOValidator.js"
import { ItemUsesDTOValidator } from "../../DTOValidators/ItemUsesDTOValidator.js"
import { ItemUsesRecoveryDTOValidator } from "../../DTOValidators/ItemUsesRecoveryDTOValidator.js"
import { ActivityValidationDTO } from "../activity/ActivityValidationDTO.js"
import { AdvancementValidationDTO } from "../advancement/AdvancementValidationDTO.js"
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
        this.uses = new ItemUsesValidationDTO()

        this.numberOfActivities = null
        this.activities = [] // ActivityValidationDTO[]
        this.effects = []    // EffectValidationDTO[]
        this.advancements = []
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

    addAdvancement(configure)
    {
        const dto = new AdvancementValidationDTO()
        configure(dto)
        this.advancements.push(dto)
        return this
    }
}

class ItemUsesValidationDTO
{
    static validator = ItemUsesDTOValidator
    constructor ()
    {
        this.max = null
        this.value = null
        this.recovery = new ItemUsesRecoveryValidationDTO()
    }
}

class ItemUsesRecoveryValidationDTO
{
    static validator = ItemUsesRecoveryDTOValidator
    constructor ()
    {
        this.period = null
        this.type = null
    }
}