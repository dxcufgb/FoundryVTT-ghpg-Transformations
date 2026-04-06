import { path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

export class ActorSpellSlotDTOValidator extends BaseDTOValidator
{
    static rules = {
        value: path("slot.value").equals(),
        max: path("slot.max").equals(),
        override: path("slot.override").equals(),
        level: path("slot.level").equals()
    }

    validate(slot, dto)
    {
        if (!slot) {
            throw new Error(`[${this.path}] Missing spell slot`)
        }

        super.validate(this.buildValidationDTO(dto), {slot})
        return true
    }
}

export class ActorSpellSlotsDTOValidator extends BaseDTOValidator
{
    validate(dto, context = null)
    {
        const actor = context?.actor ?? context

        if (!actor) {
            throw new Error(`[${this.path}] Missing actor`)
        }

        for (const [slotKey, slotDTO] of Object.entries(dto ?? {})) {
            if (!hasSpellSlotExpectations(slotDTO)) continue

            const slot = actor.system?.spells?.[slotKey]

            this.assert.isOk(
                slot,
                `[${this.path}.${slotKey}] Spell slot not found`
            )

            new ActorSpellSlotDTOValidator({
                assert: this.assert,
                path: `${this.path}.${slotKey}`,
                strict: this.strict
            }).validate(slot, slotDTO)
        }

        return true
    }
}

function hasSpellSlotExpectations(slotDTO)
{
    if (!slotDTO || typeof slotDTO !== "object") return false

    return Object.values(slotDTO).some(value =>
        value !== null &&
        value !== undefined &&
        (!Array.isArray(value) || value.length > 0)
    )
}
