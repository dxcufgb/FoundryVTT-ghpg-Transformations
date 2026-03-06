import { consumptionTargetValidator } from "./consumptionTargetValidator.js"
import { damagePartValidator } from "./damagePartValidator.js"
import { effectValidator } from "./effectValidator.js"
import { generalValidationFunctions } from "./generalValidatorFunctions.js"

export function activityValidator({
    activity,
    assert,
    logger = null
})
{
    let failed = false
    let error = null

    const api = {

        hasNumberOfAbilities(expectedNumberOfAbilities)
        {
            safe(() =>
            {
                const abilities = activity.availableAbilities
                assert.equal(
                    abilities.size,
                    expectedNumberOfAbilities,
                    `Actual number of abilities (${abilities.size}) did not match expected (${expectedNumberOfAbilities})`
                )
            })
            return api
        },

        validateIncludesAbilityTypes(expectedTypes)
        {
            safe(() =>
            {
                const abilities = activity.availableAbilities
                const actual = Array.from(abilities)

                assert.deepEqual(
                    actual.sort(),
                    expectedTypes.sort(),
                    `Expected abilities to contain "${expectedTypes.join(", ")}"`
                )
            })
            return api
        },

        hasDamagePart()
        {
            let foundDamagePart = null
            safe(() =>
            {
                const damagePart = activity.damage.parts[0]
                assert.isOk(
                    damagePart,
                    `Damage part ${damagePart} is not OK!`
                )
                foundDamagePart = damagePart
            })
            if (foundDamagePart) {
                const damagePartApi = damagePartValidator({ damagePart: foundDamagePart, assert })
                api.damagePart = damagePartApi
            }
            return api
        },

        hasSpell(expectedSpellUuid)
        {
            safe(() =>
            {
                const actualSpellUuid = activity.spell.uuid
                assert.equal(
                    actualSpellUuid,
                    expectedSpellUuid,
                    `Actual spell uuid (${actualSpellUuid}) did not match expected (${expectedSpellUuid})`
                )
            })
            return api
        },

        validateActivationType(expectedActivationType)
        {
            safe(() =>
            {
                const actualActivationType = activity.activation.type
                assert.equal(
                    expectedActivationType,
                    actualActivationType,
                    `Actual activation type (${actualActivationType}) was not ${expectedActivationType}`
                )
            })
            return api
        },

        validateSaveAbility(expectedSaveAbility)
        {
            safe(() =>
            {
                const actualSaveAbility = activity.save.ability
                const actual = Array.from(actualSaveAbility)
                assert.deepEqual(
                    actual.sort(),
                    expectedSaveAbility.sort(),
                    `Actual save ability (${expectedSaveAbility.join(", ")}) was not ${actual.join(", ")}`
                )
            })
            return api
        },

        validateSaveDcValue(expectedSaveDcValue)
        {
            safe(() =>
            {
                const actualSaveDcValue = activity.save.dc.value
                assert.equal(
                    expectedSaveDcValue,
                    actualSaveDcValue,
                    `Actual activation type (${actualSaveDcValue}) was not ${expectedSaveDcValue}`
                )
            })
            return api
        },
        validateRangeValue(expectedRangeValue)
        {
            safe(() =>
            {
                const actualRangeValue = activity.range.value
                assert.equal(
                    actualRangeValue,
                    expectedRangeValue,
                    `Actual range value (${actualRangeValue}) was not ${expectedRangeValue}`
                )

            })
            return api
        },

        hasNumberOfConsumptionTargets(expectedNumberOfConsumptionTargets)
        {
            safe(() =>
            {
                const actualNumberOfConsumptionTargets = activity.consumption.targets.length
                assert.equal(
                    actualNumberOfConsumptionTargets,
                    expectedNumberOfConsumptionTargets,
                    `Actual number of abilities (${actualNumberOfConsumptionTargets}) did not match expected (${expectedNumberOfConsumptionTargets})`
                )
            })
            return api
        },

        hasConsumptionTarget()
        {
            let foundConsumptionTarget = null
            safe(() =>
            {
                const consumptionTarget = activity.consumption.targets[0]
                assert.isOk(
                    consumptionTarget,
                    `Consumption Target ${consumptionTarget} is not OK!`
                )
                foundConsumptionTarget = consumptionTarget
            })
            if (foundConsumptionTarget) {
                const consumptionTargetApi = consumptionTargetValidator({ consumptionTarget: foundConsumptionTarget, assert })
                api.consumptionTarget = consumptionTargetApi
            }
            return api
        },

        hasNumberOfEffects(expectedNumberOfEffects)
        {
            safe(() =>
            {
                const { result, length } = generalValidationFunctions({ assert }).hasNumberOfEffects(activity, expectedNumberOfEffects)
                assert.isTrue(
                    result,
                    `number of activites (${length}) was not equal to expected number of activites (${expectedNumberOfEffects})`
                )
            })
            return api
        },

        hasEffect(effectName)
        {
            let foundEffect = null
            safe(() =>
            {
                const effects = activity.effects.find(e => e.effect.name.toLowerCase() === effectName)
                const effect = effects.effect
                assert.isOk(
                    effect,
                    `Effect ${effectName} is not OK!`
                )
                foundEffect = effect
            })
            if (foundEffect) {
                const effectApi = effectValidator({ effect: foundEffect, assert })
                api.effect = effectApi
            }
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
