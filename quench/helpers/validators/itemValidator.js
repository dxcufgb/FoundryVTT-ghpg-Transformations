import { activityValidator } from "./activityValidator.js"
import { effectValidator } from "./effectValidator.js"
import { generalValidationFunctions } from "./generalValidatorFunctions.js"

export function itemValidator({
    item,
    assert,
    logger = null
})
{
    let failed = false
    let error = null

    const api = {

        validateUsesLeft(expectedUsesLeft)
        {
            safe(() =>
            {
                const usesLeft = item.system.uses.max - item.system.uses.spent
                assert.equal(
                    usesLeft,
                    expectedUsesLeft,
                    `Actual uses left (${usesLeft}) was not equal to expected uses left (${expectedUsesLeft})`
                )
            })
            return api
        },

        isType(expectedType)
        {
            safe(() =>
            {
                assert.equal(
                    item.type,
                    expectedType,
                    `Actual type (${item.type}) was not equal to expected type (${expectedType})`
                )
            })
            return api
        },

        hasNumberOfActivities(expectedNumberOfActivities)
        {
            safe(() =>
            {
                const activities = item.system.activities.contents
                assert.isOk(
                    activities.length,
                    expectedNumberOfActivities,
                    `Actual number of activites (${activities.length}) was not equal to expected number of activites (${expectedNumberOfActivities})`
                )
            })
            return api
        },

        hasActivity(name = null)
        {
            let foundActivity = null
            safe(() =>
            {
                if (name == null) {
                    const activity = item.system.activities.contents[0]
                    assert.isOk(
                        activity,
                        `Activity ${activity} is not OK!`
                    )
                    foundActivity = activity
                } else {
                    const activity = item.system.activities.contents.find(a => a.name == name)
                    assert.isOk(
                        activity,
                        `Activity ${activity} is not OK!`
                    )
                    foundActivity = activity
                }
            })
            if (foundActivity) {
                const activityApi = activityValidator({ activity: foundActivity, assert })
                api.activity = activityApi
            }
            return api
        },

        hasNumberOfEffects(expectedNumberOfEffects)
        {
            safe(() =>
            {
                const { result, length } = generalValidationFunctions({ assert }).hasNumberOfEffects(item, expectedNumberOfEffects)
                assert.isTrue(
                    result,
                    `Actual number of activites (${length}) was not equal to expected number of activites (${expectedNumberOfEffects})`
                )
            })
            return api
        },

        hasEffect(name = null)
        {
            let foundEffect = null
            safe(() =>
            {
                if (name == null) {
                    const effect = item.effects.contents[0]
                    assert.isOk(
                        effect,
                        `Activity ${effect} is not OK!`
                    )
                    foundEffect = effect
                } else {
                    const effect = item.effect.contents.find(a => a.name == name)
                    assert.isOk(
                        effect,
                        `Activity ${effect} is not OK!`
                    )
                    foundEffect = effect
                }
            })
            if (foundEffect) {
                const effectApi = effectValidator({ effect: foundEffect, assert })
                api.effect = effectApi
            }
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

    return api
}
