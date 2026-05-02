import { RangeDTOValidator } from "../../DTOValidators/RangeDTOValidator.js"

// @ts-check
export class RangeValidationDTO
{
    static validator = RangeDTOValidator

    constructor ()
    {
        this.long = null
        this.override = null
        this.reach = null
        this.scalar = null
        this.special = null
        this.units = null
        this.value = null
    }
}
