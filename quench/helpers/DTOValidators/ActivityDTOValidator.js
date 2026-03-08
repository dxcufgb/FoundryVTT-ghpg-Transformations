import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"
import { ConsumptionDTOValidator } from "./ConsumptionDTOValidator.js"
import { DamagePartDTOValidator } from "./DamagePartDTOValidator.js"
import { EffectDTOValidator } from "./EffectDTOValidator.js"

// @ts-check
export class ActivityDTOValidator extends BaseDTOValidator
{
    static rules = {

        activationType: path("activity.activation.type").equals(),
        saveDc: path("activity.save.dc.value").equals(),
        spellUuid: path("activity.spell.uuid").equals(),
        attackBonus: path("activity.attack.bonus").equals(),
        abilityTypes: resolve(ctx => Array.from(ctx.activity.availableAbilities ?? [])).equalsArray(),
        saveAbility: resolve(ctx => Array.from(ctx.activity.save?.ability ?? [])).equalsArray(),
        isConcentration: path("activity.duration.concentration").equals()
    }

    /**
     * @param {any} activity
     * @param {import("../validationDTOs/activity/ActivityValidationDTO.js").ActivityValidationDTO} dto
     */
    validate(activity, dto)
    {
        console.log("Transformations | ActivityDTOValidator.validate called with:", activity, dto)

        if (!activity)
            throw new Error(`[${this.path}] Missing activity`)

        // run rule DSL
        super.validate(this.buildValidationDTO(dto), { activity })

        this.validateDamageParts(activity, dto.damageParts)
        // this.validateConsumption(activity, dto.consumption)
        this.validateEffects(activity, dto.effects)

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
}
