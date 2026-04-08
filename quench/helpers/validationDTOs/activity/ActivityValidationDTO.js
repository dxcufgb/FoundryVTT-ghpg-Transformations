import { ActivityDTOValidator } from "../../DTOValidators/ActivityDTOValidator.js"
import { ActivityDurationDTOValidator } from "../../DTOValidators/ActivityDurationDTOValidator.js"
import { ActivityUsesDTOValidator } from "../../DTOValidators/ActivityUsesDTOValidator.js"
import { ActivityUsesRecoveryDTOValidator } from "../../DTOValidators/ActivityUsesRecoveryDTOValidator.js"
import { AffectsDTOValidator } from "../../DTOValidators/AffectsDTOValidator.js"
import { ConsumptionValidationDTO } from "../consumption/ConsumptionValidationDTO.js"
import { CriticalDamageValidationDTO } from "../criticalDamage/CriticalDamageValidationDTO.js"
import { DamagePartValidationDTO } from "../damagePart/DamagePartValidationDTO.js"
import { EffectValidationDTO } from "../effect/EffectValidationDTO.js"
import { HealingValidationDTO } from "../healing/HealingValidationDTO.js"
import { RangeValidationDTO } from "../range/RangeValidationDTO.js"
import { SummonValidationDTO } from "../summon/SummonValidationDTO.js"
import { TargetDTOValidator } from "../../DTOValidators/TargetDTOValidator.js"
import { TemplateDTOValidator } from "../../DTOValidators/TemplateDTOValidator.js"
import { TransformationDTOValidator } from "../../DTOValidators/TransformationDTOValidator.js"
import { TransformationSettingsDTOValidator } from "../../DTOValidators/TransformationSettingsDTOValidator.js"

// @ts-check
export class ActivityValidationDTO
{
    static validator = ActivityDTOValidator

    constructor()
    {
        this.name = null
        this.abilityTypes = null
        this.activationType = null
        this.isConcentration = null

        this.saveAbility = null
        this.saveDc = null

        this.checkAbility = null
        this.checkDc = null

        this.spellUuid = null
        this.usesLeft = null

        this.damageParts = [] // DamagePartValidationDTO[]
        this.consumption = new ConsumptionValidationDTO()
        this.duration = new ActivityDurationValidationDTO()
        this.effects = []
        this.range = new RangeValidationDTO()
        this.settings = new TransformationSettingsValidationDTO()
        this.target = new TargetValidationDTO()
        this.transform = new TransformationValidationDTO()
        this.transformationChoices = []
        this.uses = new ActivityUsesValidationDTO()
        this.summons = []

        defineLazyDTOProperty(this, "critical", () => new CriticalDamageValidationDTO())
        defineLazyDTOProperty(this, "healing", () => new HealingValidationDTO())
    }

    addSummon(configure)
    {
        const dto = new SummonValidationDTO()
        configure(dto)
        this.summons.push(dto)
        return this
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

    constructor()
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

    constructor()
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

    constructor()
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

    constructor()
    {
        this.concentration = null
        this.override = null
        this.scalar = null
        this.special = null
        this.units = null
        this.value = null
    }
}

class ActivityUsesValidationDTO
{
    static validator = ActivityUsesDTOValidator

    constructor()
    {
        this.max = null
        this.value = null
        this.recovery = []
    }

    addRecovery(configure)
    {
        const dto = new ActivityUsesRecoveryValidationDTO()
        configure(dto)
        this.recovery.push(dto)
        return this
    }
}

class ActivityUsesRecoveryValidationDTO
{
    static validator = ActivityUsesRecoveryDTOValidator

    constructor()
    {
        this.period = null
        this.type = null
    }
}

export class TransformationSettingsValidationDTO
{
    static validator = TransformationSettingsDTOValidator

    constructor()
    {
        this.preset = null
        this.effects = []
        this.keep = []
        this.merge = []
        this.other = []
        this.spellLists = []
        this.transformTokens = null
        this.minimumAC = null
        this.tempFormula = null
    }
}

export class TransformationValidationDTO
{
    static validator = TransformationDTOValidator

    constructor()
    {
        this.customize = null
        this.mode = null
        this.preset = null
    }
}

function defineLazyDTOProperty(target, propertyName, createDTO)
{
    let proxy = null

    Object.defineProperty(target, propertyName, {
        enumerable: true,
        configurable: true,
        get()
        {
            if (Object.prototype.hasOwnProperty.call(this, `__${propertyName}`))
                return this[`__${propertyName}`]

            if (!proxy) {
                proxy = new Proxy({}, {
                    get: (_, key) =>
                    {
                        if (key === "constructor")
                            return undefined

                        const current = this[`__${propertyName}`]
                        return current?.[key]
                    },
                    set: (_, key, value) =>
                    {
                        const dto = createDTO()
                        Object.defineProperty(this, `__${propertyName}`, {
                            value: dto,
                            writable: true,
                            configurable: true
                        })
                        Object.defineProperty(this, propertyName, {
                            value: dto,
                            writable: true,
                            enumerable: true,
                            configurable: true
                        })
                        dto[key] = value
                        return true
                    }
                })
            }

            return proxy
        },
        set(value)
        {
            Object.defineProperty(this, `__${propertyName}`, {
                value,
                writable: true,
                configurable: true
            })
            Object.defineProperty(this, propertyName, {
                value,
                writable: true,
                enumerable: true,
                configurable: true
            })
        }
    })
}
