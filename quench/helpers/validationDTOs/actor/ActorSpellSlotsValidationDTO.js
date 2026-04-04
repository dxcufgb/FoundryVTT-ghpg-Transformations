import {
    ActorSpellSlotDTOValidator,
    ActorSpellSlotsDTOValidator
} from "../../DTOValidators/ActorSpellSlotsDTOValidator.js"

export class ActorSpellSlotsValidationDTO
{
    static validator = ActorSpellSlotsDTOValidator

    constructor()
    {
        defineLazyDTOProperty(this, "spell1", () => new ActorSpellSlotValidationDTO())
        defineLazyDTOProperty(this, "spell2", () => new ActorSpellSlotValidationDTO())
        defineLazyDTOProperty(this, "spell3", () => new ActorSpellSlotValidationDTO())
        defineLazyDTOProperty(this, "spell4", () => new ActorSpellSlotValidationDTO())
        defineLazyDTOProperty(this, "spell5", () => new ActorSpellSlotValidationDTO())
        defineLazyDTOProperty(this, "spell6", () => new ActorSpellSlotValidationDTO())
        defineLazyDTOProperty(this, "spell7", () => new ActorSpellSlotValidationDTO())
        defineLazyDTOProperty(this, "spell8", () => new ActorSpellSlotValidationDTO())
        defineLazyDTOProperty(this, "spell9", () => new ActorSpellSlotValidationDTO())
        defineLazyDTOProperty(this, "pact", () => new ActorSpellSlotValidationDTO())
    }
}

export class ActorSpellSlotValidationDTO
{
    static validator = ActorSpellSlotDTOValidator

    constructor()
    {
        this.value = null
        this.max = null
        this.override = null
        this.level = null
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
            if (Object.prototype.hasOwnProperty.call(this, `__${propertyName}`)) {
                return this[`__${propertyName}`]
            }

            if (!proxy) {
                proxy = new Proxy({}, {
                    get: (_, key) =>
                    {
                        if (key === "constructor") {
                            return undefined
                        }

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
