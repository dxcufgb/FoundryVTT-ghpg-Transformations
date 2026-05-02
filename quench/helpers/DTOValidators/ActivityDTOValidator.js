import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"
import { ConsumptionDTOValidator } from "./ConsumptionDTOValidator.js"
import { DamagePartDTOValidator } from "./DamagePartDTOValidator.js"
import { EffectDTOValidator } from "./EffectDTOValidator.js"
import { SummonDTOValidator } from "./SummonDTOValidator.js"

// @ts-check
export class ActivityDTOValidator extends BaseDTOValidator
{
    static rules = {
        id: resolve(ctx =>
            ctx.activity?.id ??
            ctx.activity?._id ??
            null
        ).equals(),
        type: path("activity.type").equals(),
        activationType: path("activity.activation.type").equals(),
        saveDc: path("activity.save.dc.value").equals(),
        saveDcFormula: path("activity.save.dc.formula").equals(),
        checkDc: path("activity.check.dc.value").equals(),
        spellUuid: path("activity.spell.uuid").equals(),
        attackBonus: path("activity.attack.bonus").equals(),
        attackType: path("activity.attack.type.value").equals(),
        attackFlat: path("activity.attack.flat").equals(),
        attackMode: path("activity.attackMode").equals(),
        attackRollPerTarget: path("activity.attackRollPerTarget").equals(),
        macroName: path("activity.macroData.name").equals(),
        triggeredActivityRollAs:
            path("activity.midiProperties.triggeredActivityRollAs").equals(),
        damageIncludeBase: path("activity.damage.includeBase").equals(),
        usesLeft: resolve(ctx =>
        {
            const uses = ctx.activity?.uses
            if (!uses) return null

            if (uses.value != null)
                return uses.value

            if (uses.max != null && uses.spent != null)
                return Math.max((uses.max ?? 0) - (uses.spent ?? 0), 0)

            return null
        }).equals(),
        abilityTypes: resolve(ctx => Array.from(ctx.activity.availableAbilities ?? [])).equalsArray(),
        saveAbility: resolve(ctx => Array.from(ctx.activity.save?.ability ?? [])).equalsArray(),
        checkAbility: resolve(ctx => Array.from(ctx.activity.check?.ability ?? [])).equalsArray(),
        checkAssociated: resolve(ctx => Array.from(ctx.activity.check?.associated ?? [])).equalsArray(),
        isConcentration: path("activity.duration.concentration").equals(),
        transformationChoices: resolve(ctx =>
            Array.from(ctx.activity.availableProfiles ?? []).map(profile => profile.uuid)
        ).equalsArray()
    }

    /**
     * @param {any} activity
     * @param {import("../validationDTOs/activity/ActivityValidationDTO.js").ActivityValidationDTO} dto
     */
    validate(activity, dto)
    {
        if (!activity)
            throw new Error(`[${this.path}] Missing activity`)

        // run rule DSL
        super.validate(this.buildValidationDTO(dto), {activity})

        this.validateDamageParts(activity, dto.damageParts)
        // this.validateConsumption(activity, dto.consumption)
        this.validateEffects(activity, dto.effects)
        this.validateSummons(activity, dto.summons)

        return true
    }

    validateDamageParts(activity, damageParts)
    {
        if (!damageParts?.length) return

        const activityDamageParts = activity.damage?.parts ?? []

        damageParts.forEach((damagePartDTO, index) =>
        {
            const damagePart = activityDamageParts[index]

            this.assert.isOk(
                damagePart,
                `[${this.path}.damageParts[${index}]] Damage part not found`
            )

            new DamagePartDTOValidator({
                assert: this.assert,
                path: `${this.path}.damageParts[${index}]`,
                strict: this.strict
            }).validate(damagePart, damagePartDTO)
        })
    }

    validateConsumption(activity, consumption)
    {
        if (!consumption) return

        new ConsumptionDTOValidator({
            assert: this.assert,
            path: `${this.path}.consumption`,
            strict: this.strict
        }).validate(activity.consumption, consumption)
    }

    validateEffects(activity, effects)
    {
        if (!effects?.length) return

        const activityEffects = activity.effects

        effects.forEach((effectDTO, index) =>
        {
            const effect = activityEffects.find(e =>
                !effectDTO.name || e.effect.name === effectDTO.name
            )

            this.assert.isOk(
                effect,
                `[${this.path}.effects[${index}]] Effect not found`
            )

            const effectContext = {
                effectObject: effect,
                effectType: "activity"
            }

            new EffectDTOValidator({
                assert: this.assert,
                path: `${this.path}.effects[${index}]`,
                strict: this.strict
            }).validate(effectContext, effectDTO)
        })
    }

    validateSummons(activity, summons)
    {
        if (!summons?.length) return

        const activityProfiles = activity.profiles ?? []

        summons.forEach((summonDTO, index) =>
        {
            const summon = activityProfiles[index]

            this.assert.isOk(
                summon,
                `[${this.path}.summons[${index}]] Summon profile not found`
            )

            new SummonDTOValidator({
                assert: this.assert,
                path: `${this.path}.summons[${index}]`,
                strict: this.strict
            }).validate(summon, summonDTO)
        })
    }
}
