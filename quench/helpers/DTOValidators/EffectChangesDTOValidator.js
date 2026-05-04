import { resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

export class EffectChangesDTOValidator extends BaseDTOValidator
{
    static rules = {
        count: resolve(ctx => getChanges(ctx)).count().equals(),
        changes: resolve(ctx => getChanges(ctx)).deepEquals()
    }
}

function getChanges(ctx)
{
    const effect = ctx?.effect?.effectObject?.effect ?? ctx?.effect ?? null
    return effect?.changes ?? []
}
