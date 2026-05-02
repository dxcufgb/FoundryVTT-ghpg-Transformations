import { ItemDTOValidator } from "../../DTOValidators/ItemDTOValidator.js"
import { ItemUsesDTOValidator } from "../../DTOValidators/ItemUsesDTOValidator.js"
import { ItemUsesRecoveryDTOValidator } from "../../DTOValidators/ItemUsesRecoveryDTOValidator.js"
import { ActivityValidationDTO } from "../activity/ActivityValidationDTO.js"
import { AdvancementValidationDTO } from "../advancement/AdvancementValidationDTO.js"
import { DamagePartValidationDTO } from "../damagePart/DamagePartValidationDTO.js"
import { EffectValidationDTO } from "../effect/EffectValidationDTO.js"
import { FlagValidationDTO } from "../flag/FlagValidationDTO.js"
import { RangeValidationDTO } from "../range/RangeValidationDTO.js"

// @ts-check
export class ItemValidationDTO
{
    static validator = ItemDTOValidator

    constructor()
    {
        this.itemName = null
        this.expectedItemUuids = []
        this.img = null
        this.identifier = null
        this.descriptionIncludes = null
        this.descriptionChatIncludes = null

        this.type = null
        this.activationType = null
        this.equipped = null
        this.proficient = null
        this.propertiesIncludes = null
        this.usesLeft = null
        this.uses = new ItemUsesValidationDTO()

        this.numberOfAdvancements = null
        this.numberOfActivities = null
        this.damageParts = {}
        this.activities = [] // ActivityValidationDTO[]
        this.effects = []    // EffectValidationDTO[]
        this.advancements = []
        this.flags = new FlagValidationDTO()

        defineLazyDTOProperty(this, "range", () => new RangeValidationDTO())
    }

    addDamagePart(partKeyOrConfigure, maybeConfigure = null)
    {
        const partKey =
                  typeof partKeyOrConfigure === "string"
                      ? partKeyOrConfigure
                      : "base"
        const configure =
                  typeof partKeyOrConfigure === "function"
                      ? partKeyOrConfigure
                      : maybeConfigure

        const dto = new DamagePartValidationDTO()
        configure(dto)
        this.damageParts[partKey] = dto
        return this
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

    constructor()
    {
        this.max = null
        this.value = null
        this.recovery = []
    }

    addRecovery(configure)
    {
        const dto = new ItemUsesRecoveryValidationDTO()
        configure(dto)
        this.recovery.push(dto)
        return this
    }
}

class ItemUsesRecoveryValidationDTO
{
    static validator = ItemUsesRecoveryDTOValidator

    constructor()
    {
        this.period = null
        this.type = null
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
