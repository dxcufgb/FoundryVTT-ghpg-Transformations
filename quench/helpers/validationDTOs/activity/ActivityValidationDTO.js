import { ActivityDTOValidator } from "../../DTOValidators/ActivityDTOValidator.js"
import { ActivityDurationDTOValidator } from "../../DTOValidators/ActivityDurationDTOValidator.js"
import { AffectsDTOValidator } from "../../DTOValidators/AffectsDTOValidator.js"
import { ConsumptionValidationDTO } from "../consumption/ConsumptionValidationDTO.js"
import { DamagePartValidationDTO } from "../damagePart/DamagePartValidationDTO.js"
import { EffectValidationDTO } from "../effect/EffectValidationDTO.js"
import { RangeValidationDTO } from "../range/RangeValidationDTO.js"
import { TargetDTOValidator } from "../../DTOValidators/TargetDTOValidator.js"
import { TemplateDTOValidator } from "../../DTOValidators/TemplateDTOValidator.js"

// @ts-check
export class ActivityValidationDTO
{
    static validator = ActivityDTOValidator
    constructor ()
    {
        this.name = null
        this.abilityTypes = null
        this.activationType = null
        this.isConcentration = null

        this.saveAbility = null
        this.saveDc = null

        this.spellUuid = null

        this.damageParts = [] // DamagePartValidationDTO[]
        this.consumption = new ConsumptionValidationDTO()
        this.duration = new ActivityDurationValidationDTO()
        this.effects = []
        this.range = new RangeValidationDTO()
        this.target = new TargetValidationDTO()
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

class TargetValidationDTO
{
    static validator = TargetDTOValidator

    constructor ()
    {
        this.affects = new AffectsValidationDTO()
        this.template = new TemplateValidationDTO()

        this.override = null
        this.prompt = null
    }
}

class AffectsValidationDTO
{
    static validator = AffectsDTOValidator

    constructor ()
    {
        this.choice = null
        this.count = null
        this.scalar = null
        this.special = null
        this.type = null
    }
}

class TemplateValidationDTO
{
    static validator = TemplateDTOValidator

    constructor ()
    {
        this.contiguous = null
        this.count = null
        this.height = null
        this.size = null
        this.type = null
        this.units = null
        this.width = null
    }
}

class ActivityDurationValidationDTO
{
    static validator = ActivityDurationDTOValidator
    constructor ()
    {
        this.concentration = null
        this.override = null
        this.scalar = null
        this.special = null
        this.units = null
        this.value = null
    }
}