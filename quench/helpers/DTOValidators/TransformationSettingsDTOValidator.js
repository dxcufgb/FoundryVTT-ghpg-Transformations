import { path, resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

function toArray(value)
{
    if (value == null) return []
    if (Array.isArray(value)) return value
    return Array.from(value)
}

// @ts-check
export class TransformationSettingsDTOValidator extends BaseDTOValidator
{
    static rules = {
        preset: path("activity.settings.preset").equals(),
        effects: resolve(ctx => toArray(ctx.activity.settings?.effects)).equalsArray(),
        keep: resolve(ctx => toArray(ctx.activity.settings?.keep)).equalsArray(),
        merge: resolve(ctx => toArray(ctx.activity.settings?.merge)).equalsArray(),
        other: resolve(ctx => toArray(ctx.activity.settings?.other)).equalsArray(),
        spellLists: resolve(ctx => toArray(ctx.activity.settings?.spellLists)).equalsArray(),
        transformTokens: path("activity.settings.transformTokens").equals(),
        minimumAC: path("activity.settings.minimumAC").equals(),
        tempFormula: path("activity.settings.tempFormula").equals()
    }
}
