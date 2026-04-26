import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class EffectDTOValidator extends BaseDTOValidator
{
    static rules = {
        type: path("effect.type").equals(),
        collisionTypes: path("effect.system.collisionTypes").toArray().equalsArray(),
        distanceFormula: path("effects.system.distanceFormula").equals(),
        statuses: resolve(ctx =>
        {
            const contextObject = ctx?.effect
            let effectStatuses = ctx?.effect?.statuses
            if (contextObject.effectType) {
                const effectType = contextObject.effectType
                const effectObject = contextObject.effectObject
                switch (effectType) {
                    case "activity":
                        effectStatuses = effectObject.effect.statuses

                }
            }
            return effectStatuses
        }).toArray().equalsArray(),
        match: path("effects.contents").effectsMatch(),
        count: path("effects.contents").count().equals(),
        has: path("effects.contents").pluck("name").includesAll(),
        notHas: path("effects.contents").pluck("name").notIncludesAny(),
        withOrigin: path("effects.contents").whereOrigin().count().equals()
    }

    validate(effect, dto)
    {
        if (!effect)
            throw new Error(`[${this.path}] Missing effect`)

        super.validate(this.buildValidationDTO(dto), {effect})

        return true
    }
}
