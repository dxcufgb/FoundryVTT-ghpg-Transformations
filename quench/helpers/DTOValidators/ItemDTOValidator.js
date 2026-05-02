import { path, resolve } from "../rules/RuleBuilder.js"
import { AdvancementDTOValidator } from "./AdvancementDTOValidator.js"
import { DamagePartDTOValidator } from "./DamagePartDTOValidator.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"
import { ActivityDTOValidator } from "./ActivityDTOValidator.js"
import { EffectDTOValidator } from "./EffectDTOValidator.js"

// @ts-check
export class ItemDTOValidator extends BaseDTOValidator
{
    static rules = {
        itemName: path("item.name").equals(),
        img: path("item.img").equals(),
        identifier: path("item.system.identifier").equals(),
        descriptionIncludes: resolve(ctx =>
            ctx.item.system?.description?.value ??
            ""
        ).includes(),
        descriptionChatIncludes: resolve(ctx =>
            ctx.item.system?.description?.chat ??
            ""
        ).includes(),
        type: path("item.type").equals(),
        activationType: resolve(ctx =>
            ctx.item.system?.activation?.type ??
            ctx.item.activation?.type ??
            null
        ).equals(),
        equipped: path("item.system.equipped").equals(),
        proficient: path("item.system.proficient").equals(),
        propertiesIncludes: resolve(ctx =>
            Array.from(ctx.item.system?.properties ?? [])
        ).includesAll(),
        systemSubType: path("item.system.type.subtype").equals(),
        systemType: path("item.system.type.value").equals(),
        usesLeft: resolve(ctx =>
        {
            const uses = ctx.item.system?.uses
            if (!uses) return null

            return (uses.max ?? 0) - (uses.spent ?? 0)
        }).equals(),
        numberOfAdvancements: path("item.system.advancement").count().equals(),
        numberOfActivities: path("item.system.activities.contents").count().equals(),
        numberOfEffects: path("item.effects.contents").count().equals()
    }

    validate(item, dto)
    {
        if (!item)
            throw new Error(`[${this.path}] Missing item`)

        // rule engine
        super.validate(this.buildValidationDTO(dto), { item })

        this.validateDamageParts(item, dto.damageParts)
        this.validateActivities(item, dto.activities)
        this.validateAdvancements(item, dto.advancements)
        this.validateEffects(item, dto.effects)

        return true
    }

    // ------------------------------------------------
    // Damage Parts
    // ------------------------------------------------

    validateDamageParts(item, damageParts)
    {
        if (!damageParts) return

        if (Array.isArray(damageParts)) {
            const itemDamageParts =
                item.system?.damage?.parts ??
                item.system?.damage?.base?.parts ??
                item.damage?.parts ??
                []

            damageParts.forEach((damagePartDTO, index) =>
            {
                const damagePart = itemDamageParts[index]

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

            return
        }

        for (const [damagePartKey, damagePartDTO] of Object.entries(damageParts)) {
            const damagePart =
                item.system?.damage?.[damagePartKey] ??
                item.damage?.[damagePartKey]

            this.assert.isOk(
                damagePart,
                `[${this.path}.damageParts.${damagePartKey}] Damage part not found`
            )

            new DamagePartDTOValidator({
                assert: this.assert,
                path: `${this.path}.damageParts.${damagePartKey}`,
                strict: this.strict
            }).validate(damagePart, damagePartDTO)
        }
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
                activityDTO.id
                    ? itemActivities.find(activity =>
                        (activity?.id ?? activity?._id ?? null) === activityDTO.id
                    )
                    : activityDTO.name
                    ? itemActivities.find(a => a.name === activityDTO.name)
                    : activityDTO.macroName
                        ? itemActivities.find(activity =>
                            activity?.macroData?.name === activityDTO.macroName
                        )
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
