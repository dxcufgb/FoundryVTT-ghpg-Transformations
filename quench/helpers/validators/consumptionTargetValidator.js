export function consumptionTargetValidator({
    consumptionTarget,
    assert,
    logger = null
})
{
    let failed = false
    let error = null

    const api = {

        validateType(expectedType)
        {
            safe(() =>
            {
                const type = consumptionTarget.type
                assert.equal(
                    type,
                    expectedType,
                    `Actual type of consumption target (${type}) did not match expected (${expectedType})`
                )
            })
            return api
        },

        validateValue(expectedValue)
        {
            safe(() =>
            {
                const value = consumptionTarget.value
                assert.equal(
                    value,
                    expectedValue,
                    `Actual type of consumption target (${value}) did not match expected (${expectedValue})`
                )
            })
            return api
        },

        validate()
        {
            if (failed) throw error
            return true
        }
    }

    function safe(fn)
    {
        // try {
        fn()
        // } catch (e) {
        //     failed = true
        //     error = e
        // }
    }

    return api
}
