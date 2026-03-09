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
        this.items = null
        this.spell = new AdvancementConfigurationSpellValidationDTO()
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
