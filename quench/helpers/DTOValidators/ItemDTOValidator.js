import { path, resolve } from "../rules/RuleBuilder.js"
import { AdvancementDTOValidator } from "./AdvancementDTOValidator.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"
import { ActivityDTOValidator } from "./ActivityDTOValidator.js"
import { EffectDTOValidator } from "./EffectDTOValidator.js"

// @ts-check
export class ItemDTOValidator extends BaseDTOValidator
{
    static rules = {

        type: path("item.type").equals(),
        systemSubType: path("item.system.type.subtype").equals(),
        systemType: path("item.system.type.value").equals(),
        usesLeft: resolve(ctx =>
        {
            const uses = ctx.item.system?.uses
            if (!uses) return null

            return (uses.max ?? 0) - (uses.spent ?? 0)
        }).equals(),
        numberOfActivities: path("item.system.activities.contents").count().equals(),
        numberOfEffects: path("item.effects.contents").count().equals()
    }

    validate(item, dto)
    {
        if (!item)
            throw new Error(`[${this.path}] Missing item`)

        // rule engine
        super.validate(this.buildValidationDTO(dto), { item })

        this.validateActivities(item, dto.activities)
        this.validateAdvancements(item, dto.advancements)
        this.validateEffects(item, dto.effects)

        return true
    }

    // ------------------------------------------------
    // Activities
    // ------------------------------------------------

    validateActivities(item, activities)
    {
        if (!activities?.length) return

        const itemActivities = item.system?.activities?.contents ?? []

        activities.forEach((activityDTO, index) =>
        {
            const activity =
                activityDTO.name
                    ? itemActivities.find(a => a.name === activityDTO.name)
                    : itemActivities[index]

            this.assert.isOk(
                activity,
                `[${this.path}.activities[${index}]] Activity not found`
            )

            new ActivityDTOValidator({
                assert: this.assert,
                path: `${this.path}.activities[${index}]`,
                strict: this.strict
            }).validate(activity, activityDTO)
        })
    }

    validateAdvancements(item, advancements)
    {
        if (!advancements?.length) return

        const itemAdvancements = item.system?.advancement ?? []

        advancements.forEach((advancementDTO, index) =>
        {
            const advancement = itemAdvancements[index]

            this.assert.isOk(
                advancement,
                `[${this.path}.advancements[${index}]] Advancement not found`
            )

            new AdvancementDTOValidator({
                assert: this.assert,
                path: `${this.path}.advancements[${index}]`,
                strict: this.strict
            }).validate(advancement, advancementDTO)
        })
    }

    // ------------------------------------------------
    // Effects
    // ------------------------------------------------

    validateEffects(item, effects)
    {
        if (!effects?.length) return

        const itemEffects = item.effects.contents

        effects.forEach((effectDTO, index) =>
        {
            const effect = itemEffects.find(e =>
                !effectDTO.name || e.name === effectDTO.name
            )

            this.assert.isOk(
                effect,
                `[${this.path}.effects[${index}]] Effect not found`
            )

            new EffectDTOValidator({
                assert: this.assert,
                path: `${this.path}.effects[${index}]`,
                strict: this.strict
            }).validate(effect, effectDTO)
        })
    }
}
