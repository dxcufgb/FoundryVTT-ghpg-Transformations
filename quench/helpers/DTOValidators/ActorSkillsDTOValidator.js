import { SKILL } from "../../../config/constants.js"
import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"
import {
    ActorAbilityProficiencyDTOValidator,
    ActorAbilityRollDTOValidator
} from "./ActorAbilitiesDTOValidator.js"

const SKILL_KEYS = Object.values(SKILL)

export class ActorSkillsDTOValidator extends BaseDTOValidator
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

        const skills = actor.system?.skills ?? {}

        for (const key of SKILL_KEYS) {
            const skill = skills[key]
            const skillDTO = dto?.[key]

            this.assert.isOk(
                skill,
                `[${this.path}.${key}] Skill not found`
            )

            new ActorSkillDTOValidator({
                assert: this.assert,
                path: `${this.path}.${key}`,
                strict: this.strict
            }).validate(skill, skillDTO)
        }

        return true
    }
}

export class ActorSkillDTOValidator extends BaseDTOValidator
{
    static rules = {
        ability: path("skill.ability").equals(),
        value: path("skill.value").equals(),
        effectValue: path("skill.effectValue").equals(),
        bonus: path("skill.bonus").equals(),
        mod: path("skill.mod").equals(),
        proficient: path("skill.proficient").equals(),
        total: path("skill.total").equals(),
        passive: path("skill.passive").equals()
    }

    validate(skill, dto)
    {
        if (!skill)
            throw new Error(`[${this.path}] Missing skill`)

        super.validate(buildRuleOnlyDTO(dto, this.constructor.rules), { skill })

        new ActorAbilityRollDTOValidator({
            assert: this.assert,
            path: `${this.path}.roll`,
            strict: this.strict
        }).validate(skill.roll, dto.roll)

        new ActorSkillBonusesDTOValidator({
            assert: this.assert,
            path: `${this.path}.bonuses`,
            strict: this.strict
        }).validate(skill.bonuses, dto.bonuses)

        new ActorAbilityProficiencyDTOValidator({
            assert: this.assert,
            path: `${this.path}.prof`,
            strict: this.strict
        }).validate(skill.prof, dto.prof)

        return true
    }
}

export class ActorSkillBonusesDTOValidator extends BaseDTOValidator
{
    static rules = {
        check: path("bonuses.check").equals(),
        passive: path("bonuses.passive").equals()
    }

    validate(bonuses, dto)
    {
        if (!bonuses)
            throw new Error(`[${this.path}] Missing bonuses`)

        super.validate(this.buildValidationDTO(dto), { bonuses })
        return true
    }
}

function buildRuleOnlyDTO(dto, rules = {})
{
    return Object.fromEntries(
        Object.keys(rules).map(key => [key, dto?.[key]])
    )
}
