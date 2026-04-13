import { HealingDTOValidator } from "../../DTOValidators/HealingDTOValidator.js"

// @ts-check
export class HealingValidationDTO
{
    static validator = HealingDTOValidator

    constructor()
    {
        this.custom = null
        this.customEnabled = null
        this.roll = null
        this.scalingNumber = null
        this.types = null
        this.numberOfTypes = null
        this.bonus = null
    }
}
