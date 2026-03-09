import { FlagDTOValidator } from "../../DTOValidators/FlagDTOValidator.js"

export class FlagValidationDTO
{
    static validator = FlagDTOValidator

    constructor ()
    {
        this.match = []
        this.not = []
    }
}