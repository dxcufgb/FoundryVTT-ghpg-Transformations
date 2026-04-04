import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class SummonDTOValidator extends BaseDTOValidator
{
    static rules = {
        count: path("summon.count").equals(),
        name: path("summon.name").equals(),
        numberOfTypes: resolve(ctx =>
        {
            const types = ctx.summon?.types
            if (types == null) return null

            if (Array.isArray(types)) return types.length
            if (types instanceof Set || types instanceof Map) return types.size
            if (typeof types === "object") return Object.keys(types).length

            return null
        }).equals(),
        typeKeys: resolve(ctx =>
        {
            const types = ctx.summon?.types
            if (types == null) return []

            if (Array.isArray(types)) {
                return types
            }

            if (types instanceof Set) {
                return Array.from(types)
            }

            if (types instanceof Map) {
                return Array.from(types.keys())
            }

            if (typeof types === "object") {
                return Object.keys(types)
            }

            return []
        }).includesAll(),
        uuid: path("summon.uuid").equals()
    }

    /**
     * @param {any} summon
     * @param {import("../validationDTOs/summon/SummonValidationDTO.js").SummonValidationDTO} dto
     */
    validate(summon, dto)
    {
        if (!summon) {
            throw new Error(`[${this.path}] Missing summon`)
        }

        super.validate(this.buildValidationDTO(dto), { summon })

        return true
    }
}

// @ts-check
export class SummonLevelDTOValidator extends BaseDTOValidator
{
    static rules = {
        min: path("summon.level.min").equals(),
        max: path("summon.level.max").equals()
    }

    validate(dtoOrLevel, dtoOrContext = null)
    {
        const isNestedContext =
            dtoOrContext != null &&
            typeof dtoOrContext === "object" &&
            "summon" in dtoOrContext

        const dto = isNestedContext ? dtoOrLevel : dtoOrContext
        const level = isNestedContext
            ? dtoOrContext.summon?.level
            : dtoOrLevel

        if (!level) {
            throw new Error(`[${this.path}] Missing summon level`)
        }

        super.validate(this.buildValidationDTO(dto), { summon: { level } })

        return true
    }
}
