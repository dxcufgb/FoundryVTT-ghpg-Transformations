export function effectValidator({
    assert,
    effect,
    logger = null })
{
    let failed = false
    let error = null

    const api = {

        validateType(type)
        {
            safe(() =>
            {
                assert.equal(
                    effect.type,
                    type,
                    `Effect type (${effect.type}) was not ${type}`
                )
            })
            return api
        },

        validateCollisionTypes(expectedCollisionType)
        {
            safe(() =>
            {
                const collisionTypes = effect.system.collisionTypes
                const actual = Array.from(collisionTypes)

                assert.deepEqual(
                    actual.sort(),
                    expectedCollisionType.sort(),
                    `Expected collisionTypes to contain "${expectedCollisionType.join(", ")}"`
                )
            })
            return api
        },

        validateDistanceFormula(expectedDistanceFormula)
        {
            safe(() =>
            {
                assert.equal(
                    effect.system.distanceFormula,
                    expectedDistanceFormula,
                    `Actual distanceFormula (${effect.system.distanceFormula}) did not match expected distanceFormula (${expectedDistanceFormula})"`
                )
            })
            return api
        },

        validateStatuses(expectedStatuses)
        {
            safe(() =>
            {
                const statuses = effect.statuses
                const actual = Array.from(statuses)

                assert.deepEqual(
                    actual.sort(),
                    expectedStatuses.sort(),
                    `Expected collisionTypes to contain "${expectedStatuses.join(", ")}"`
                )
            })
            return api
        },

        // 🔥 This allows assert.isTrue(...) compatibility
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

    function getMessagesByType(type)
    {
        switch (type) {
            case "RollTable":
                return game.messages.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )
            case "NA":
                return game.messages
            default:
                console.error(`messageValidator, Unknown messageType: "${type}"`)
        }
    }
    return api
}
