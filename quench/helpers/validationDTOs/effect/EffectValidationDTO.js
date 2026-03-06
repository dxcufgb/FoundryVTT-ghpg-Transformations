import { EffectDTOValidator } from "../../DTOValidators/EffectDTOValidator.js"

// @ts-check
export class EffectValidationDTO
{
    static validator = EffectDTOValidator
    constructor ()
    {
        this.name = null
        this.type = null
        this.collisionTypes = null
        this.distanceFormula = null
        this.statuses = null
        this.has = []
        this.notHas = []
        this.count = null
        this.match = null
        this.withOrigin = null
    }
}
