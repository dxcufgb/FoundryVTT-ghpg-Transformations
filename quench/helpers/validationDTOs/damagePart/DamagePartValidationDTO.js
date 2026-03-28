import { DamagePartDTOValidator } from "../../DTOValidators/DamagePartDTOValidator.js"

// @ts-check
export class DamagePartValidationDTO
{
    static validator = DamagePartDTOValidator

    constructor()
    {
        this.custom = null
        this.roll = null
        this.damageTypes = null
        this.numberOfTypes = null
    }
}
