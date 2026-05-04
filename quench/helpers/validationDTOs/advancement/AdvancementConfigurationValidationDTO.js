import {
    AdvancementConfigurationDTOValidator,
    AdvancementConfigurationSpellDTOValidator,
    AdvancementConfigurationSpellUsesDTOValidator
} from "../../DTOValidators/AdvancementConfigurationDTOValidator.js"

// @ts-check
export class AdvancementConfigurationValidationDTO
{
    static validator = AdvancementConfigurationDTOValidator

    constructor ()
    {
        this.allowReplacements = null
        this.cap = null
        this.items = null
        this.fixed = null
        this.grants = null
        this.locked = null
        this.max = null
        this.mode = null
        this.optional = null
        this.points = null
        this.recommendation = null
        this.choices = null
        defineLazyDTOProperty(
            this,
            "spell",
            () => new AdvancementConfigurationSpellValidationDTO()
        )
    }
}

export class AdvancementConfigurationSpellValidationDTO
{
    static validator = AdvancementConfigurationSpellDTOValidator

    constructor ()
    {
        this.method = null
        this.prepared = null
        this.uses = new AdvancementConfigurationSpellUsesValidationDTO()
    }
}

export class AdvancementConfigurationSpellUsesValidationDTO
{
    static validator = AdvancementConfigurationSpellUsesDTOValidator

    constructor ()
    {
        this.max = null
        this.per = null
        this.requireSlot = null
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

                        const dto = ensureLazyDTO(this, propertyName, createDTO)
                        return dto?.[key]
                    },
                    set: (_, key, value) =>
                    {
                        const dto = ensureLazyDTO(this, propertyName, createDTO)
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

function ensureLazyDTO(target, propertyName, createDTO)
{
    if (Object.prototype.hasOwnProperty.call(target, `__${propertyName}`))
        return target[`__${propertyName}`]

    const dto = createDTO()

    Object.defineProperty(target, `__${propertyName}`, {
        value: dto,
        writable: true,
        configurable: true
    })
    Object.defineProperty(target, propertyName, {
        value: dto,
        writable: true,
        enumerable: true,
        configurable: true
    })

    return dto
}
