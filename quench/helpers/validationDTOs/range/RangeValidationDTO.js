import { RangeDTOValidator } from "../../DTOValidators/RangeDTOValidator.js"

// @ts-check
export class RangeValidationDTO
{
    static validator = RangeDTOValidator

    constructor ()
    {
        this.override = null
        this.scalar = null
        this.special = null
        this.units = null
        this.value = null
    }
}
