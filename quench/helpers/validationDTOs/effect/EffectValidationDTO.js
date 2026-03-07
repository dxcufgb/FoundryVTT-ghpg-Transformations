import { EffectDTOValidator } from "../../DTOValidators/EffectDTOValidator.js"
import { EffectChangesDTOValidator } from "../../DTOValidators/EffectChangesDTOValidator.js"
import { EffectDurationDTOValidator } from "../../DTOValidators/EffectDurationDTOValidator.js"
import { FlagValidationDTO } from "../flag/FlagValidationDTO.js"

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
        this.changes = new EffectChangesValidationDTO()
        this.flags = new FlagValidationDTO()
        this.duration = new EffectDurationValidationDTO()
    }
}


class EffectChangesValidationDTO
{
    static validator = EffectChangesDTOValidator
    constructor ()
    {
        this.count = null
        this.changes = []
    }
}

class EffectDurationValidationDTO
{
    static validator = EffectDurationDTOValidator
    constructor ()
    {
        this.duration = null
        this.rounds = null
        this.seconds = null
        this.startRound = null
        this.StartTime = null
        this.StartTurn = null
        this.turns = null
        this.type = null
    }
}
