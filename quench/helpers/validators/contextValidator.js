export function contextValidator({
    context,
    assert,
    logger = null
})
{
    let failed = false
    let error = null

    const api = {

        validateSavingThrowDisadvantage(expectedDisadvantage)
        {
            safe(() =>
            {
                const actualDisadvantage = context.disadvantage
                assert.equal(
                    actualDisadvantage,
                    expectedDisadvantage,
                    `Actual disadvantage (${actualDisadvantage}) did not match expected (${expectedDisadvantage})`
                )
            })
            return api
        },

        validateSavingThrowAdvantage(expectedAdvantage)
        {
            safe(() =>
            {
                const actualAdvantage = context.advantage
                assert.equal(
                    actualAdvantage,
                    expectedAdvantage,
                    `Actual disadvantage (${actualAdvantage}) did not match expected (${expectedAdvantage})`
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
