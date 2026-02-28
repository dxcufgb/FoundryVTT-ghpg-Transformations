import { ABILITY, ATTRIBUTE, ROLL_TYPE, SKILL } from "../../config/constants.js"

export function actorValidators({ actor, assert, logger = null })
{
    let failed = false
    let error = null

    const api = {

        validateDeathSavingThrowAdvantage()
        {
            safe(() =>
            {
                const deathSaveAdvantage = actor.flags?.["midi-qol"]?.advantage?.deathSave
                assert.isTrue(deathSaveAdvantage, "Actor does not have advantage on death saves!")
            })
            return api
        },

        hasEffect(effectName)
        {
            safe(() =>
            {
                const effect = actor.effects.find(e => e.name === effectName)
                assert.isOk(effect, `Effect ${effectName} is not OK!`)
            })
            return api
        },

        hasNoEffect(origin = null)
        {
            safe(() =>
            {
                const effects = origin
                    ? actor.effects.filter(e => e.origin === origin)
                    : actor.effects

                assert.equal(effects.length, 0, `There are more than 0 effects with origin ${origin} on actor!`)
            })
            return api
        },

        hasHp(expectedHp, variant)
        {
            safe(() =>
            {
                const actualHp = actor.system?.attributes?.hp?.[variant]
                assert.equal(actualHp, expectedHp, `Expected hp (${expectedHp}) of type ${variant} was not equal to actual hp (${actualHp})!`)
            })
            return api
        },

        hasMovementBonus(expectedMovementBonus)
        {
            safe(() =>
            {
                const actual = actor.system?.attributes?.movement?.bonus
                assert.equal(String(actual), String(expectedMovementBonus), `expected movement bonus (${expectedMovementBonus}) was not equal to actual movement bonus (${actual})`)
            })
            return api
        },

        hasDisadvantage(identifier, type = null)
        {
            safe(() =>
            {
                const roll = resolveRollMode(identifier, type)
                assert.equal(roll?.mode, -1, `Actor does not have disadvantage on identifier (${identifier}) and roll type (${type})`)
            })
            return api
        },

        hasToolsDisadvantage()
        {
            safe(() =>
            {
                assert.equal(actor.flags["midi-qol"].disadvantage.tool.all, true)
            })
            return api
        },

        hasAdvantage(identifier, type = null)
        {
            safe(() =>
            {
                const rollMode = resolveRollMode(identifier, type)
                assert.equal(rollMode?.value, 1, `Actor does not have advantage on identifier (${identifier}) and roll type (${type})`)
            })
            return api
        },

        hasExhaustionLevel(expected)
        {
            safe(() =>
            {
                const actual = actor.system?.attributes?.exhaustion
                assert.equal(actual, expected, `Actor does not have exhaustion level equal to expected! (${expected} != ${actual})`)
            })
            return api
        },

        hasDeathSaves(expectedDelta)
        {
            safe(() =>
            {
                const death = actor.system?.attributes?.death
                const delta = (death?.success ?? 0) - (death?.failure ?? 0)
                assert.equal(delta, expectedDelta, `Actor does not have death save delta equal to expected (${expectedDelta} != ${delta}), successes: ${death.success}, failures: ${death.failure}`)
            })
            return api
        },

        // 🔥 This allows assert.isTrue(...) compatibility
        valueOf()
        {
            if (failed) throw error
            return true
        }
    }

    function safe(fn)
    {
        if (failed) return

        try {
            fn()
        } catch (e) {
            failed = true
            error = e
        }
    }

    function resolveRollMode(identifier, type)
    {
        const system = actor.system

        const skillValues = Object.values(SKILL)
        const abilityValues = Object.values(ABILITY)
        const attributeValues = Object.values(ATTRIBUTE?.ROLLABLE ?? {})

        // Skills
        if (skillValues.includes(identifier)) {
            return system.skills?.[identifier]?.roll
        }

        // Abilities
        if (abilityValues.includes(identifier)) {

            if (type === ROLL_TYPE.ABILITY_CHECK)
                return system.abilities?.[identifier]?.check?.roll

            if (type === ROLL_TYPE.SAVING_THROW)
                return system.abilities?.[identifier]?.save?.roll

            assert.fail("Roll type must be provided for ability checks")
        }

        // Attributes
        if (attributeValues.includes(identifier)) {
            return system.attributes?.[identifier]?.roll
        }

        return null
    }

    return api
}
