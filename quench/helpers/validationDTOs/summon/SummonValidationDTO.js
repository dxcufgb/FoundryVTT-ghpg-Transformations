import { SummonDTOValidator, SummonLevelDTOValidator } from "../../DTOValidators/SummonDTOValidator.js"

// @ts-check
export class SummonValidationDTO
{
    static validator = SummonDTOValidator

    constructor ()
    {
        this.count = null
        this.level = new SummonLevelValidationDTO()
        this.name = null
        this.numberOfTypes = null
        this.typeKeys = null
        this.uuid = null
    }
}

class SummonLevelValidationDTO
{
    static validator = SummonLevelDTOValidator

    constructor ()
    {
        this.min = null
        this.max = null
    }
}
