import { DamagePartDTOValidator } from "../../DTOValidators/DamagePartDTOValidator.js"

// @ts-check
export class DamagePartValidationDTO
{
    static validator = DamagePartDTOValidator

    constructor()
    {
        this.custom = null
        this.customEnabled = null
        this.roll = null
        this.scalingNumber = null
        this.damageTypes = null
        this.numberOfTypes = null
        this.bonus = null
    }
}
