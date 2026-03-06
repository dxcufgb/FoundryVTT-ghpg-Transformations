// fey-exhaustion-recovery-viewmodel.js
export function createFeyExhaustionRecoveryViewModel({
    stage,
    exhaustion,
    hitDiceAvailable,
    logger = null
})
{
    logger?.debug?.("createFeyExhaustionRecoveryViewModel", {
        stage,
        exhaustion,
        hitDiceAvailable
    })

    const maxByHitDice = Math.floor(hitDiceAvailable / stage)
    const maxRecoverable = Math.min(exhaustion, maxByHitDice)

    const options = Array.from({ length: maxRecoverable }, (_, i) =>
    {
        const value = i + 1
        return {
            value,
            cost: value * stage
        }
    })

    return {
        stage,
        exhaustion,
        hitDiceAvailable,
        maxRecoverable,
        options
    }
}