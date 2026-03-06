import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"
import { DamagePartDTOValidator } from "./DamagePartDTOValidator.js"

// @ts-check
export class ActivityDTOValidator extends BaseDTOValidator
{
    static rules = {

        activationType: path("activity.activation.type").equals(),
        saveDc: path("activity.save.dc.value").equals(),
        spellUuid: path("activity.spell.uuid").equals(),
        abilityTypes: resolve(ctx => Array.from(ctx.activity.availableAbilities ?? [])).equalsArray(),
        saveAbility: resolve(ctx => Array.from(ctx.activity.save?.ability ?? [])).equalsArray()
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
        super.validate(dto, { activity })

        // nested validation
        this.validateDamageParts(activity, dto.damageParts)

        return true
    }

    // ------------------------------------------------
    // DAMAGE PARTS
    // ------------------------------------------------

    validateDamageParts(activity, damageParts)
    {
        if (!damageParts?.length) return

        const parts = activity.damage?.parts ?? []

        damageParts.forEach((damageDTO, index) =>
        {
            const part = parts[index]

            this.assert.isOk(
                part,
                `[${this.path}.damageParts[${index}]] Missing damage part`
            )

            new DamagePartDTOValidator({
                assert: this.assert,
                path: `${this.path}.damageParts[${index}]`,
                strict: this.strict
            }).validate(part, damageDTO)
        })
    }
}