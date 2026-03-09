import { ConsupmtionTargetDTOValidator } from "../../DTOValidators/ConsumptionTargetDTOValidator.js"

// @ts-check
export class ConsumptionTargetValidationDTO
{
    static validator = ConsupmtionTargetDTOValidator
    constructor ()
    {
        this.type = null    // string
        this.value = null   // number | string
    }
}
