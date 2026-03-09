import { BaseDTOValidator } from "./BaseDTOValidator.js"
import { AdvancementConfigurationDTOValidator } from "./AdvancementConfigurationDTOValidator.js"

// @ts-check
export class AdvancementDTOValidator extends BaseDTOValidator
{
    /**
     * @param {any} advancement
     * @param {import("../validationDTOs/advancement/AdvancementValidationDTO.js").AdvancementValidationDTO} dto
     */
    validate(advancement, dto)
    {
        if (!advancement)
            throw new Error(`[${this.path}] Missing advancement`)

        super.validate(this.buildValidationDTO(dto), { advancement })
        this.validateConfigurations(advancement, dto.configurations)

        return true
    }

    validateConfigurations(advancement, configurations)
    {
        if (!configurations?.length) return

        const actualConfigurations = advancement.configuration ? [advancement.configuration] : []

        configurations.forEach((configurationDTO, index) =>
        {
            const configuration = actualConfigurations[index]

            this.assert.isOk(
                configuration,
                `[${this.path}.configurations[${index}]] Advancement configuration not found`
            )

            new AdvancementConfigurationDTOValidator({
                assert: this.assert,
                path: `${this.path}.configurations[${index}]`,
                strict: this.strict
            }).validate(configuration, configurationDTO)
        })
    }
}
