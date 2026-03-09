export function generalValidationFunctions({
    assert
})
{
    function hasNumberOfEffects(obj, expectedNumberOfEffects)
    {
        const effectsContentsLength = obj.effects?.contents?.length
        const effectsLength = obj.effects?.length
        const length = effectsContentsLength !== undefined ? effectsContentsLength : effectsLength !== undefined ? effectsLength : 0
        assert.equal(
            length,
            expectedNumberOfEffects
        )
        return { result: true, actualLength: length }
    }

    return {
        hasNumberOfEffects
    }
}