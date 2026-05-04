import { AdvancementDTOValidator } from "../../DTOValidators/AdvancementDTOValidator.js"
import { AdvancementConfigurationValidationDTO } from "./AdvancementConfigurationValidationDTO.js"

// @ts-check
export class AdvancementValidationDTO
{
    static validator = AdvancementDTOValidator

    constructor ()
    {
        this.type = null
        this.configurations = []
    }

    addConfiguration(configure)
    {
        const dto = new AdvancementConfigurationValidationDTO()
        configure(dto)
        this.configurations.push(dto)
        return this
    }
}
