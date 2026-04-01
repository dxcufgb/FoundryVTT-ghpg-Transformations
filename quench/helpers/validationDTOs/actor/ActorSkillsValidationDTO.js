import {
    ActorAbilityProficiencyDTOValidator,
    ActorAbilityRollCountStateDTOValidator,
    ActorAbilityRollDTOValidator,
    ActorAbilityRollModeCountsDTOValidator
} from "../../DTOValidators/ActorAbilitiesDTOValidator.js"
import {
    ActorSkillBonusesDTOValidator,
    ActorSkillDTOValidator,
    ActorSkillsDTOValidator
} from "../../DTOValidators/ActorSkillsDTOValidator.js"

// @ts-check
export class ActorSkillsValidationDTO
{
    static validator = ActorSkillsDTOValidator

    constructor()
    {
        this.acr = new ActorSkillValidationDTO()
        this.ani = new ActorSkillValidationDTO()
        this.arc = new ActorSkillValidationDTO()
        this.ath = new ActorSkillValidationDTO()
        this.dec = new ActorSkillValidationDTO()
        this.his = new ActorSkillValidationDTO()
        this.ins = new ActorSkillValidationDTO()
        this.itm = new ActorSkillValidationDTO()
        this.inv = new ActorSkillValidationDTO()
        this.med = new ActorSkillValidationDTO()
        this.nat = new ActorSkillValidationDTO()
        this.prc = new ActorSkillValidationDTO()
        this.prf = new ActorSkillValidationDTO()
        this.per = new ActorSkillValidationDTO()
        this.rel = new ActorSkillValidationDTO()
        this.slt = new ActorSkillValidationDTO()
        this.ste = new ActorSkillValidationDTO()
        this.sur = new ActorSkillValidationDTO()
    }
}

class ActorSkillValidationDTO
{
    static validator = ActorSkillDTOValidator

    constructor()
    {
        this.ability = null
        this.roll = new ActorSkillRollValidationDTO()
        this.value = null
        this.bonuses = new ActorSkillBonusesValidationDTO()
        this.effectValue = null
        this.bonus = null
        this.mod = null
        this.prof = new ActorSkillProficiencyValidationDTO()
        this.proficient = null
        this.total = null
        this.passive = null
    }
}

class ActorSkillRollValidationDTO
{
    static validator = ActorAbilityRollDTOValidator

    constructor()
    {
        this.min = null
        this.max = null
        this.mode = null
        this.modeCounts = new ActorSkillRollModeCountsValidationDTO()
    }
}

class ActorSkillRollModeCountsValidationDTO
{
    static validator = ActorAbilityRollModeCountsDTOValidator

    constructor()
    {
        this.override = null
        this.advantages = new ActorSkillRollCountStateValidationDTO()
        this.disadvantages = new ActorSkillRollCountStateValidationDTO()
    }
}

class ActorSkillRollCountStateValidationDTO
{
    static validator = ActorAbilityRollCountStateDTOValidator

    constructor()
    {
        this.count = null
        this.suppressed = null
    }
}

class ActorSkillBonusesValidationDTO
{
    static validator = ActorSkillBonusesDTOValidator

    constructor()
    {
        this.check = null
        this.passive = null
    }
}

class ActorSkillProficiencyValidationDTO
{
    static validator = ActorAbilityProficiencyDTOValidator

    constructor()
    {
        this.deterministic = null
        this._baseProficiency = null
        this.multiplier = null
        this.rounding = null
    }
}
