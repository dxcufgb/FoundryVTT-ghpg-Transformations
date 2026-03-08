import { BaseDTOValidator } from "./BaseDTOValidator.js"

//@ts-check
export class ContextDTOValidator extends BaseDTOValidator
{
    static rules = {

        disadvantage: {
            resolve: ctx => ctx.context.disadvantage,
            type: "equals"
        },

        advantage: {
            resolve: ctx => ctx.context.advantage,
            type: "equals"
        },

        rolls: {
            resolve: ctx => ctx.context.rolls ?? [],
            type: "indexedMatch"
        }
    }

    validate(dto)
    {
        console.log("Transformations | ContextDTOValidator.validate called with:", dto)

        const context = dto.context

        if (!context) {
            throw new Error(`[${this.path}] Missing context in DTO`)
        }

        super.validate(this.buildValidationDTO(dto), { context })

        return true
    }
}
