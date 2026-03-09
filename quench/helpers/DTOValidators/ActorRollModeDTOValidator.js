import { ROLL_MODE, ROLL_TYPE } from "../../../config/constants.js"
import { resolve, path } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

// @ts-check
export class ActorRollModeDTOValidator extends BaseDTOValidator
{
    static rules = {
        advantage: resolve((ctx, expected) =>
            expected.map(e =>
            {
                e.expected = ROLL_MODE.ADVANTAGE.int
                resolveRollMode(ctx.actor, e.identifier, e.type)
            })
        ).allRollModes(),
        disadvantage: resolve((ctx, expected) =>
            expected.map(e =>
            {
                e.expected = ROLL_MODE.DISADVANTAGE.int
                resolveRollMode(ctx.actor, e.identifier, e.type)
            })
        ).allRollModes(),
        toolDisadvantage: path("actor.flags.midi-qol.disadvantage.tool.all").equals()
    }

}
export function resolveRollMode(actor, identifier, type)
{
    const system = actor.system

    //Skills
    if (system.skills?.[identifier])
        return system.skills[identifier].roll?.mode ?? system.skills[identifier].roll?.mode ?? 0

    // Ability checks
    if (type === ROLL_TYPE.ABILITY_CHECK)
        return system.abilities?.[identifier]?.check?.roll?.mode ?? 0

    // Saving throws
    if (type === ROLL_TYPE.SAVING_THROW)
        return system.abilities?.[identifier]?.save?.roll?.mode ?? 0

    // Attribute rolls
    if (system.attributes?.[identifier]?.roll)
        return system.attributes[identifier].roll?.mode ?? 0

    return 0
}