import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class EffectDTOValidator extends BaseDTOValidator
{
    static rules = {
        name: path("effects.name").equals(),
        type: path("effects.type").equals(),
        collisionTypes: path("effect.system.collisionTypes").toArray().equalsArray(),
        distanceFormula: path("effects.system.distanceFormula").equals(),
        statuses: path("effect.statuses").toArray().equalsArray(),
        match: path("effects.contents").effectsMatch(),
        count: path("effects.contents").count().equals(),
        has: path("effects.contents").pluck("name").includesAll(),
        notHas: path("effects.contents").pluck("name").notIncludesAny(),
        withOrigin: path("effects.contents").whereOrigin().count().equals(),
    }

    validate(effect, dto)
    {
        if (!effect)
            throw new Error(`[${this.path}] Missing effect`)

        super.validate(dto, { effect })

        return true
    }
}