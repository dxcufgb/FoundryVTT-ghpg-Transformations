import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class ConsupmtionTargetDTOValidator extends BaseDTOValidator
{
    static rules = {
        type: path("target.type").equals(),
        value: path("target.value").equals()
    }

    /**
     * @param {any} target
     * @param {import("../validationDTOs/consumptionTarget/ConsumptionTargetValidationDTO.js").ConsumptionTargetValidationDTO} dto
     */
    validate(target, dto)
    {
        console.log("Transformations | ConsupmtionTargetDTOValidator.validate called with:", target, dto)

        if (!target)
            throw new Error(`[${this.path}] Missing consumption target`)

        super.validate(this.buildValidationDTO(dto), { target })

        return true
    }
}
