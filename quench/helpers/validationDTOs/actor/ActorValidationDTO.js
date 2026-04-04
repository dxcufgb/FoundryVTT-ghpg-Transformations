import { ActorDTOValidator } from "../../DTOValidators/ActorDTOValidator.js"
import { ActorAbilitiesValidationDTO } from "./ActorAbilitiesValidationDTO.js"
import { ActorSkillsValidationDTO } from "./ActorSkillsValidationDTO.js"
import { ActorRollModeDTOValidator } from "../../DTOValidators/ActorRollModeDTOValidator.js"
import { ActorStatsDTOValidator } from "../../DTOValidators/ActorStatsDTOValidator.js"
import { EffectValidationDTO } from "../effect/EffectValidationDTO.js"
import { FlagValidationDTO } from "../flag/FlagValidationDTO.js"
import { HitDieValidationDTO } from "../hitDie/HitDieValidationDTO.js"
import { ItemValidationDTO } from "../item/ItemValidationDTO.js"
import { ActorSpellSlotsValidationDTO } from "./ActorSpellSlotsValidationDTO.js"

// @ts-check
export class ActorValidationDTO
{
    static validator = ActorDTOValidator

    /**
     * @param {any} actor
     */
    constructor(actor)
    {
        this.actor = actor

        this.stats = new ActorStatsDTO()
        this.abilities = new ActorAbilitiesValidationDTO()
        this.skills = new ActorSkillsValidationDTO()
        this.effects = new EffectValidationDTO()
        this.items = [] // ItemValidationDTO[]
        this.rollModes = new ActorRollModeDTO()
        this.flags = new FlagValidationDTO()
    }

    /**
     * @param {(item: ItemValidationDTO) => void} configure
     */
    addItem(configure)
    {
        const itemDTO = new ItemValidationDTO()
        configure(itemDTO)
        this.items.push(itemDTO)
        return this
    }
}

/**
 * Actor Stats DTO
 */
export class ActorStatsDTO
{
    static validator = ActorStatsDTOValidator

    constructor()
    {
        this.hp = []                 // [{ value, variant }]
        this.ac = null
        this.exhaustion = null
        this.deathSaveDelta = null
        this.movementSpeed = null    // { type, value }
        this.movementBonus = null
        this.resistances = []
        this.vulnerabilities = []
        this.immunities = []
        this.hitDices = new HitDieValidationDTO()
        this.spellSlots = new ActorSpellSlotsValidationDTO()
    }
}

// /**
//  * Actor Roll Modes DTO
//  */
export class ActorRollModeDTO
{
    static validator = ActorRollModeDTOValidator

    constructor()
    {
        this.advantage = []
        this.disadvantage = []

        this.allD20Disadvantage = null
    }
}
