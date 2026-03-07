import { BaseDTOValidator } from "./BaseDTOValidator.js"
import { ConsupmtionTargetDTOValidator } from "./ConsumptionTargetDTOValidator.js"

// @ts-check
export class ConsumptionDTOValidator extends BaseDTOValidator
{
    /**
     * @param {any} consumption
     * @param {import("../validationDTOs/consumption/ConsumptionValidationDTO.js").ConsumptionValidationDTO} dto
     */
    validate(consumption, dto)
    {
        console.log("Transformations | ConsumptionDTOValidator.validate called with:", consumption, dto)

        if (!consumption) {
            if (!dto.targets?.length)
                return true

            throw new Error(`[${this.path}] Missing consumption`)
        }

        super.validate(dto, { consumption })
        this.validateTargets(consumption, dto.targets)

        return true
    }

    validateTargets(consumption, targets)
    {
        if (!targets?.length) return

        const consumptionTargets = consumption.targets ?? []

        targets.forEach((targetDTO, index) =>
        {
            const target = consumptionTargets[index]

            this.assert.isOk(
                target,
                `[${this.path}.targets[${index}]] Consumption target not found`
            )

            new ConsupmtionTargetDTOValidator({
                assert: this.assert,
                path: `${this.path}.targets[${index}]`,
                strict: this.strict
            }).validate(target, targetDTO)
        })
    }
}
