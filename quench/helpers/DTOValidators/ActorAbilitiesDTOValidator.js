import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

const ABILITY_KEYS = [
    "str",
    "dex",
    "con",
    "int",
    "wis",
    "cha"
]

export class ActorAbilitiesDTOValidator extends BaseDTOValidator
{
    validate(dtoOrActor, dtoOrContext = null)
    {
        const isNestedContext =
            dtoOrContext != null &&
            typeof dtoOrContext === "object" &&
            "actor" in dtoOrContext

        const dto = isNestedContext ? dtoOrActor : dtoOrContext
        const actor = isNestedContext ? dtoOrContext.actor : dtoOrActor

        if (!actor)
            throw new Error(`[${this.path}] Missing actor`)

        const abilities = actor.system?.abilities ?? {}

        for (const key of ABILITY_KEYS) {
            const ability = abilities[key]
            const abilityDTO = dto?.[key]

            this.assert.isOk(
                ability,
                `[${this.path}.${key}] Ability not found`
            )

            new ActorAbilityDTOValidator({
                assert: this.assert,
                path: `${this.path}.${key}`,
                strict: this.strict
            }).validate(ability, abilityDTO)
        }

        return true
    }
}

export class ActorAbilityDTOValidator extends BaseDTOValidator
{
    static rules = {
        value: path("ability.value").equals(),
        proficient: path("ability.proficient").equals(),
        max: path("ability.max").equals(),
        mod: path("ability.mod").equals(),
        saveBonus: path("ability.saveBonus").equals(),
        checkBonus: path("ability.checkBonus").equals(),
        attack: path("ability.attack").equals(),
        dc: path("ability.dc").equals()
    }

    validate(ability, dto)
    {
        if (!ability)
            throw new Error(`[${this.path}] Missing ability`)

        super.validate(buildRuleOnlyDTO(dto, this.constructor.rules), { ability })

        new ActorAbilityBonusesDTOValidator({
            assert: this.assert,
            path: `${this.path}.bonuses`,
            strict: this.strict
        }).validate(ability.bonuses, dto.bonuses)

        new ActorAbilityCheckDTOValidator({
            assert: this.assert,
            path: `${this.path}.check`,
            strict: this.strict
        }).validate(ability.check, dto.check)

        new ActorAbilitySaveDTOValidator({
            assert: this.assert,
            path: `${this.path}.save`,
            strict: this.strict
        }).validate(ability.save, dto.save)

        new ActorAbilityProficiencyDTOValidator({
            assert: this.assert,
            path: `${this.path}.checkProf`,
            strict: this.strict
        }).validate(ability.checkProf, dto.checkProf)

        new ActorAbilityProficiencyDTOValidator({
            assert: this.assert,
            path: `${this.path}.saveProf`,
            strict: this.strict
        }).validate(ability.saveProf, dto.saveProf)

        return true
    }
}

export class ActorAbilityBonusesDTOValidator extends BaseDTOValidator
{
    static rules = {
        check: path("bonuses.check").equals(),
        save: path("bonuses.save").equals()
    }

    validate(bonuses, dto)
    {
        if (!bonuses)
            throw new Error(`[${this.path}] Missing bonuses`)

        super.validate(this.buildValidationDTO(dto), { bonuses })
        return true
    }
}

export class ActorAbilityCheckDTOValidator extends BaseDTOValidator
{
    validate(check, dto)
    {
        if (!check)
            throw new Error(`[${this.path}] Missing check`)

        new ActorAbilityRollDTOValidator({
            assert: this.assert,
            path: `${this.path}.roll`,
            strict: this.strict
        }).validate(check.roll, dto.roll)

        return true
    }
}

export class ActorAbilitySaveDTOValidator extends BaseDTOValidator
{
    static rules = {
        value: path("save.value").equals()
    }

    validate(save, dto)
    {
        if (!save)
            throw new Error(`[${this.path}] Missing save`)

        super.validate(buildRuleOnlyDTO(dto, this.constructor.rules), { save })

        new ActorAbilityRollDTOValidator({
            assert: this.assert,
            path: `${this.path}.roll`,
            strict: this.strict
        }).validate(save.roll, dto.roll)

        return true
    }
}

export class ActorAbilityRollDTOValidator extends BaseDTOValidator
{
    static rules = {
        min: path("roll.min").equals(),
        max: path("roll.max").equals(),
        mode: path("roll.mode").equals()
    }

    validate(roll, dto)
    {
        if (!roll)
            throw new Error(`[${this.path}] Missing roll`)

        super.validate(buildRuleOnlyDTO(dto, this.constructor.rules), { roll })

        new ActorAbilityRollModeCountsDTOValidator({
            assert: this.assert,
            path: `${this.path}.modeCounts`,
            strict: this.strict
        }).validate(
            roll.modeCounts ?? {},
            dto.modeCounts
        )

        return true
    }
}

export class ActorAbilityRollModeCountsDTOValidator extends BaseDTOValidator
{
    static rules = {
        override: path("modeCounts.override").equals()
    }

    validate(modeCounts, dto)
    {
        if (!dto) return true

        super.validate(buildRuleOnlyDTO(dto, this.constructor.rules), { modeCounts })

        new ActorAbilityRollCountStateDTOValidator({
            assert: this.assert,
            path: `${this.path}.advantages`,
            strict: this.strict
        }).validate(modeCounts.advantages ?? {}, dto.advantages)

        new ActorAbilityRollCountStateDTOValidator({
            assert: this.assert,
            path: `${this.path}.disadvantages`,
            strict: this.strict
        }).validate(modeCounts.disadvantages ?? {}, dto.disadvantages)

        return true
    }
}

export class ActorAbilityRollCountStateDTOValidator extends BaseDTOValidator
{
    static rules = {
        count: path("state.count").equals(),
        suppressed: path("state.suppressed").equals()
    }

    validate(state, dto)
    {
        if (!dto) return true

        super.validate(this.buildValidationDTO(dto), { state })
        return true
    }
}

export class ActorAbilityProficiencyDTOValidator extends BaseDTOValidator
{
    static rules = {
        deterministic: path("proficiency.deterministic").equals(),
        _baseProficiency: path("proficiency._baseProficiency").equals(),
        multiplier: path("proficiency.multiplier").equals(),
        rounding: path("proficiency.rounding").equals()
    }

    validate(proficiency, dto)
    {
        if (!proficiency)
            throw new Error(`[${this.path}] Missing proficiency`)

        super.validate(this.buildValidationDTO(dto), { proficiency })
        return true
    }
}

function buildRuleOnlyDTO(dto, rules = {})
{
    return Object.fromEntries(
        Object.keys(rules).map(key => [key, dto?.[key]])
    )
}
