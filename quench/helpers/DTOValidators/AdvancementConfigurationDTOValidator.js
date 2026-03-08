import { resolve, path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class AdvancementConfigurationDTOValidator extends BaseDTOValidator
{
    static rules = {
        items: resolve(ctx =>
            (ctx.configuration?.items ?? []).map(item => item?.uuid ?? item)
        ).equalsArray()
    }

    /**
     * @param {any} configuration
     * @param {import("../validationDTOs/advancement/AdvancementConfigurationValidationDTO.js").AdvancementConfigurationValidationDTO} dto
     */
    validate(configuration, dto)
    {
        console.log("Transformations | AdvancementConfigurationDTOValidator.validate called with:", configuration, dto)

        if (!configuration)
            throw new Error(`[${this.path}] Missing advancement configuration`)

        super.validate(this.buildValidationDTO(dto), { configuration })

        return true
    }
}

export class AdvancementConfigurationSpellDTOValidator extends BaseDTOValidator
{
    static rules = {
        method: path("spell.method").equals(),
        prepared: path("spell.prepared").equals()
    }

    /**
     * @param {import("../validationDTOs/advancement/AdvancementConfigurationValidationDTO.js").AdvancementConfigurationSpellValidationDTO} dto
     * @param {{ configuration: any }} context
     */
    validate(dto, context)
    {
        console.log("Transformations | AdvancementConfigurationSpellDTOValidator.validate called with:", dto, context)

        const spell = context?.configuration?.spell ?? null

        if (!spell) {
            if (!hasExpectedValues(dto))
                return true

            throw new Error(`[${this.path}] Missing advancement configuration spell`)
        }

        super.validate(this.buildValidationDTO(dto), { spell })

        return true
    }
}

export class AdvancementConfigurationSpellUsesDTOValidator extends BaseDTOValidator
{
    static rules = {
        max: path("uses.max").equals(),
        per: path("uses.per").equals(),
        requireSlot: path("uses.requireSlot").equals()
    }

    /**
     * @param {import("../validationDTOs/advancement/AdvancementConfigurationValidationDTO.js").AdvancementConfigurationSpellUsesValidationDTO} dto
     * @param {{ spell: any }} context
     */
    validate(dto, context)
    {
        console.log("Transformations | AdvancementConfigurationSpellUsesDTOValidator.validate called with:", dto, context)

        const uses = context?.spell?.uses ?? null

        if (!uses) {
            if (!hasExpectedValues(dto))
                return true

            throw new Error(`[${this.path}] Missing advancement configuration spell uses`)
        }

        super.validate(this.buildValidationDTO(dto), { uses })

        return true
    }
}

function hasExpectedValues(dto)
{
    if (!dto) return false

    return Object.entries(dto).some(([, value]) =>
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0)
    )
}
