import { ActivityDTOValidator } from "../../DTOValidators/ActivityDTOValidator.js"
import { ConsumptionValidationDTO } from "../consumption/ConsumptionValidationDTO.js"
import { DamagePartValidationDTO } from "../damagePart/DamagePartValidationDTO.js"
import { EffectValidationDTO } from "../effect/EffectValidationDTO.js"
import { RangeValidationDTO } from "../range/RangeValidationDTO.js"

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
        this.consumption = new ConsumptionValidationDTO()
        this.effects = []
        this.range = new RangeValidationDTO()
    }

    addDamagePart(configure)
    {
        const dto = new DamagePartValidationDTO()
        configure(dto)
        this.damageParts.push(dto)
        return this
    }

    addConsumptionTarget(configure)
    {
        this.consumption.addTarget(configure)
        return this
    }

    addConsumption(configure)
    {
        configure(this.consumption)
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
