import { resolve } from "../rules/RuleBuilder.js"
import { BaseDTOValidator } from "./BaseDTOValidator.js"

export class EffectDurationDTOValidator extends BaseDTOValidator
{
    static rules = {
        seconds: resolve(ctx => getDuration(ctx)?.seconds).equals(),
        rounds: resolve(ctx => getDuration(ctx)?.rounds).equals(),
        turns: resolve(ctx => getDuration(ctx)?.turns).equals(),
        startRound: resolve(ctx => getDuration(ctx)?.startRound).equals(),
        startTurn: resolve(ctx => getDuration(ctx)?.startTurn).equals(),
        startTime: resolve(ctx => getDuration(ctx)?.startTime).equals()
    }
}

function getDuration(ctx)
{
    const effect = ctx?.effect?.effectObject?.effect ?? ctx?.effect ?? null
    return effect?.duration ?? null
}
