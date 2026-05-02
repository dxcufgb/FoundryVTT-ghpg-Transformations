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
                } else if (ctx.item) {
                    actual = getByPath(
                        { flags: ctx.item.flags },
                        `flags.${e.path}`
                    )
                }
                return actual

            })
        }).partialDeepMatch(),

        not: resolve((ctx, expected) =>
        {
            return expected.map(path =>
            {
                if (ctx.actor) {
                    return getByPath(
                        { flags: ctx.actor.flags },
                        `flags.${path}`
                    )
                }

                if (ctx.item) {
                    return getByPath(
                        { flags: ctx.item.flags },
                        `flags.${path}`
                    )
                }

                return undefined
            }
            )
        }).notIncludesAny()
    }
}
