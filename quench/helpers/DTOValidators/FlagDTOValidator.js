import { getByPath } from "../rules/getByPath.js"
import { resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

export class FlagDTOValidator extends BaseDTOValidator
{
    static rules = {

        match: resolve((ctx, expected) =>
        {
            return expected.map(e =>
            {
                let actual
                if (ctx.actor) {
                    actual = getByPath(
                        { flags: ctx.actor.flags },
                        `flags.${e.path}`
                    )
                } else if (ctx.effect) {
                    actual = getByPath(
                        { flags: ctx.effect.flags },
                        `flags.${e.path}`
                    )
                }
                return actual

            })
        }).partialDeepMatch(),

        not: resolve((ctx, expected) =>
        {
            return expected.map(path =>
                getByPath(
                    { flags: ctx.actor.flags },
                    `flags.${path}`
                )
            )
        }).notIncludesAny()
    }
}