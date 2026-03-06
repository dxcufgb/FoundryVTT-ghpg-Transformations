import { ActivityDTOValidator } from "../../DTOValidators/ActivityDTOValidator.js"
import { DamagePartValidationDTO } from "../damagePart/DamagePartValidationDTO.js"

// @ts-check
export class ActivityValidationDTO
{
    static validator = ActivityDTOValidator
    constructor ()
    {
        this.name = null
        this.abilityTypes = null
        this.activationType = null

        this.saveAbility = null
        this.saveDc = null

        this.spellUuid = null

        this.damageParts = [] // DamagePartValidationDTO[]
    }

    addDamagePart(configure)
    {
        const dto = new DamagePartValidationDTO()
        configure(dto)
        this.damageParts.push(dto)
        return this
    }
}
