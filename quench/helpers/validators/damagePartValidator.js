export function damagePartValidator({
    damagePart,
    assert,
    logger = null
})
{
    let failed = false
    let error = null

    const api = {

        hasNumberOfTypes(expectedNumberOfTypes)
        {
            safe(() =>
            {
                const damageTypes = damagePart.types
                assert.equal(
                    damageTypes.size,
                    expectedNumberOfTypes,
                    `Actual number of types (${damageTypes.size}) did not match expected (${expectedNumberOfTypes})`
                )
            })
            return api
        },

        validateIncludesDamageTypes(expectedTypes)
        {
            safe(() =>
            {
                const damageTypes = damagePart.types
                const actual = Array.from(damageTypes)

                assert.deepEqual(
                    actual.sort(),
                    expectedTypes.sort(),
                    `Expected damage types to contain "${expectedTypes.join(", ")}"`
                )
            })
            return api
        },

        validateDamageRoll(expectedRoll)
        {
            let foundDamagePart = null
            safe(() =>
            {
                const compiledRoll = (damagePart.number + "d" + damagePart.denomination).toString()
                assert.equal(
                    compiledRoll,
                    expectedRoll,
                    `Expected roll to be ${expectedRoll}, was ${compiledRoll}`
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
