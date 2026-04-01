import {
    ActorAbilitiesDTOValidator,
    ActorAbilityBonusesDTOValidator,
    ActorAbilityCheckDTOValidator,
    ActorAbilityDTOValidator,
    ActorAbilityProficiencyDTOValidator,
    ActorAbilityRollCountStateDTOValidator,
    ActorAbilityRollDTOValidator,
    ActorAbilityRollModeCountsDTOValidator,
    ActorAbilitySaveDTOValidator
} from "../../DTOValidators/ActorAbilitiesDTOValidator.js"

// @ts-check
export class ActorAbilitiesValidationDTO
{
    static validator = ActorAbilitiesDTOValidator

    constructor()
    {
        this.str = new ActorAbilityValidationDTO()
        this.dex = new ActorAbilityValidationDTO()
        this.con = new ActorAbilityValidationDTO()
        this.int = new ActorAbilityValidationDTO()
        this.wis = new ActorAbilityValidationDTO()
        this.cha = new ActorAbilityValidationDTO()
    }
}

class ActorAbilityValidationDTO
{
    static validator = ActorAbilityDTOValidator

    constructor()
    {
        this.value = null
        this.proficient = null
        this.max = null
        this.bonuses = new ActorAbilityBonusesValidationDTO()
        this.check = new ActorAbilityCheckValidationDTO()
        this.save = new ActorAbilitySaveValidationDTO()
        this.mod = null
        this.checkProf = new ActorAbilityProficiencyValidationDTO()
        this.saveBonus = null
        this.saveProf = new ActorAbilityProficiencyValidationDTO()
        this.checkBonus = null
        this.attack = null
        this.dc = null
    }
}

class ActorAbilityBonusesValidationDTO
{
    static validator = ActorAbilityBonusesDTOValidator

    constructor()
    {
        this.check = null
        this.save = null
    }
}

class ActorAbilityCheckValidationDTO
{
    static validator = ActorAbilityCheckDTOValidator

    constructor()
    {
        this.roll = new ActorAbilityRollValidationDTO()
    }
}

class ActorAbilitySaveValidationDTO
{
    static validator = ActorAbilitySaveDTOValidator

    constructor()
    {
        this.roll = new ActorAbilityRollValidationDTO()
        this.value = null
    }
}

class ActorAbilityRollValidationDTO
{
    static validator = ActorAbilityRollDTOValidator

    constructor()
    {
        this.min = null
        this.max = null
        this.mode = null
        this.modeCounts = new ActorAbilityRollModeCountsValidationDTO()
    }
}

class ActorAbilityRollModeCountsValidationDTO
{
    static validator = ActorAbilityRollModeCountsDTOValidator

    constructor()
    {
        this.override = null
        this.advantages = new ActorAbilityRollCountStateValidationDTO()
        this.disadvantages = new ActorAbilityRollCountStateValidationDTO()
    }
}

class ActorAbilityRollCountStateValidationDTO
{
    static validator = ActorAbilityRollCountStateDTOValidator

    constructor()
    {
        this.count = null
        this.suppressed = null
    }
}

class ActorAbilityProficiencyValidationDTO
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
