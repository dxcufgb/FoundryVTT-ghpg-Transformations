import { CriticalDamageDTOValidator } from "../../DTOValidators/CriticalDamageDTOValidator.js"

// @ts-check
export class CriticalDamageValidationDTO
{
    static validator = CriticalDamageDTOValidator

    constructor ()
    {
        this.allow = null
        this.bonus = null
    }
}
