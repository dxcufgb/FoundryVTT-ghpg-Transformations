import { path } from "../rules/RuleBuilder.js"
import { ActorRollModeDTOValidator } from "./ActorRollModeDTOValidator.js"
import { ActorStatsDTOValidator } from "./ActorStatsDTOValidator.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"
import { EffectDTOValidator } from "./EffectDTOValidator.js"
import { ItemDTOValidator } from "./ItemDTOValidator.js"

export class ActorDTOValidator extends BaseDTOValidator
{
    static rules = {

        hasItemWithSourceUuids: path("actor.items.contents").pluckFlag("transformations.sourceUuid").filter(Boolean).unique().includesAll()
    }

    validate(dto)
    {
        const actor = dto.actor

        if (!actor)
            throw new Error(`[${this.path}] Missing actor in DTO`)

        // run rule DSL
        super.validate(this.buildValidationDTO(dto), { actor })

        // nested validation
        this.validateItems(actor, dto.items)

        return true
    }

    // ------------------------------------------------
    // ITEMS
    // ------------------------------------------------

    validateItems(actor, items)
    {
        if (!items?.length) return

        const actorItems = actor.items.contents ?? actor.items

        items.forEach((itemDTO, index) =>
        {
            const item = this.findItem(actorItems, itemDTO)

            this.assert.isOk(
                item,
                `[${this.path}.items[${index}]] Item not found`
            )

            new ItemDTOValidator({
                assert: this.assert,
                path: `${this.path}.items[${index}]`,
                strict: this.strict
            }).validate(item, itemDTO)
        })
    }

    findItem(actorItems, dto)
    {
        if (dto.expectedItemUuids?.length) {

            const item = actorItems.find(i =>
                dto.expectedItemUuids.includes(
                    i.flags?.transformations?.sourceUuid
                )
            )

            return item ?? null
        }

        if (dto.itemName) {
            return actorItems.find(i => i.name === dto.itemName) ?? null
        }

        if (dto.type) {
            return actorItems.find(i => i.type === dto.type) ?? null
        }

        return null
    }
}
