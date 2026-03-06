import { ABILITY, ATTRIBUTE, ROLL_TYPE, SKILL } from "../../../config/constants.js"
import { generalValidationFunctions } from "./generalValidatorFunctions.js"
import { itemValidator } from "./itemValidator.js"

export function actorValidator({
    runtime,
    actor,
    assert,
    logger = null
})
{
    let failed = false
    let error = null

    const api = {

        validateDeathSavingThrowAdvantage()
        {
            safe(() =>
            {
                const deathSaveAdvantage = actor.flags?.["midi-qol"]?.advantage?.deathSave
                assert.isTrue(
                    deathSaveAdvantage,
                    "Actor does not have advantage on death saves!"
                )
            })
            return api
        },

        validateAllD20Disadvantage()
        {
            safe(() =>
            {
                api
                    .hasDisadvantage("acr")
                    .hasDisadvantage("ani")
                    .hasDisadvantage("arc")
                    .hasDisadvantage("ath")
                    .hasDisadvantage("dec")
                    .hasDisadvantage("his")
                    .hasDisadvantage("ins")
                    .hasDisadvantage("itm")
                    .hasDisadvantage("inv")
                    .hasDisadvantage("med")
                    .hasDisadvantage("nat")
                    .hasDisadvantage("prc")
                    .hasDisadvantage("prf")
                    .hasDisadvantage("per")
                    .hasDisadvantage("rel")
                    .hasDisadvantage("slt")
                    .hasDisadvantage("ste")
                    .hasDisadvantage("sur")
                    .hasDisadvantage("str", ROLL_TYPE.ABILITY_CHECK)
                    .hasDisadvantage("dex", ROLL_TYPE.ABILITY_CHECK)
                    .hasDisadvantage("con", ROLL_TYPE.ABILITY_CHECK)
                    .hasDisadvantage("int", ROLL_TYPE.ABILITY_CHECK)
                    .hasDisadvantage("wis", ROLL_TYPE.ABILITY_CHECK)
                    .hasDisadvantage("cha", ROLL_TYPE.ABILITY_CHECK)
                    .hasDisadvantage("str", ROLL_TYPE.SAVING_THROW)
                    .hasDisadvantage("dex", ROLL_TYPE.SAVING_THROW)
                    .hasDisadvantage("con", ROLL_TYPE.SAVING_THROW)
                    .hasDisadvantage("int", ROLL_TYPE.SAVING_THROW)
                    .hasDisadvantage("wis", ROLL_TYPE.SAVING_THROW)
                    .hasDisadvantage("cha", ROLL_TYPE.SAVING_THROW)
                    .hasDisadvantage("concentration")
                    .hasDisadvantage("death")
                    .hasDisadvantage("init")
                    .hasToolsDisadvantage()
            })
            return api
        },

        validateItemsOnActor({
            expectedItemUuids = [],
            itemName = null
        })
        {
            let foundItem = null
            safe(() =>
            {
                if (expectedItemUuids.length > 0) {
                    const actorSourceIds = actor.items.map(i =>
                        i.flags.transformations?.sourceUuid
                    )
                    for (const uuid of expectedItemUuids) {
                        assert.isTrue(
                            actorSourceIds.includes(uuid),
                            `Expected UUID ${uuid} was not found on actor`
                        )
                    }
                    foundItem = actor.items.find(i =>
                        expectedItemUuids.includes(
                            i.flags.transformations?.sourceUuid
                        )
                    )
                }
                if (itemName) {
                    const item = actor.items.find(i =>
                        i.name === itemName
                    )
                    assert.isOk(
                        item,
                        `Item ${itemName} is not OK!`
                    )
                    foundItem = item
                }
            })
            if (foundItem) {
                const itemApi = itemValidator({ item: foundItem, assert })
                api.item = itemApi
            }
            return api
        },

        validateRaceItemSubTypeOnActor(subtype)
        {
            safe(() =>
            {
                const raceItem = runtime.infrastructure.itemRepository.findEmbeddedByType(actor, "race")
                assert.equal(
                    raceItem?.system?.type?.subtype,
                    subtype,
                    `actual subtype: ${raceItem?.system?.type?.subtype} was not expected: ${subtype}`
                )
            })
            return api
        },

        hasEffect(effectName)
        {
            safe(() =>
            {
                const effect = actor.effects.find(e => e.name === effectName)
                assert.isOk(
                    effect,
                    `Effect ${effectName} is not OK!`
                )
            })
            return api
        },

        notHasEffect(effectName)
        {
            safe(() =>
            {
                const effect = actor.effects.find(e => e.name === effectName)
                assert.equal(
                    effect,
                    undefined,
                    `Effect ${effectName} exists!`
                )
            })
            return api
        },

        hasEffects(expectedNumberOfEffects, matchMode = "or", filters = [])
        {
            safe(() =>
            {
                let activityEffects = []
                switch (matchMode) {
                    case "or":
                        activityEffects = actor.effects.filter(e =>
                            filters.some(filter => e[filter.key] === filter.value)
                        )
                        break
                    case "and":
                        activityEffects = actor.effects.filter(e =>
                            filters.some(filter => e[filter.key] === filter.value)
                        )
                        break
                    default:
                        console.error(`Unkown matchMode (${matchMode}) in actorValidator.hasEffects`)
                }
                assert.equal(
                    activityEffects.length,
                    expectedNumberOfEffects,
                    `Expected number of effects (${expectedNumberOfEffects}) did not match actual number of effects (${activityEffects.length}) using matchMode: ${matchMode}`
                )
            })
            return api
        },

        validateNumberOfEffectsFromOrigin(origin, expectedNumber)
        {
            safe(() =>
            {
                const effects = actor.effects.filter(e =>
                    e.origin?.includes(origin)
                )
                assert.equal(
                    effects.length,
                    expectedNumber,
                    `Number of effects was not correct! actual: ${effects.length}, expected: ${expectedNumber}`
                )
            })
            return api
        },

        validateNumberOfEffects(expectedNumberOfEffects)
        {
            safe(() =>
            {
                const { result, length } = generalValidationFunctions({ assert }).hasNumberOfEffects(actor, expectedNumberOfEffects)
                assert.isTrue(
                    result,
                    `Actual number of activites (${length}) was not equal to expected number of activites (${expectedNumberOfEffects})`

                )
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

                assert.equal(
                    effects.length,
                    0,
                    `There are more than 0 effects with origin ${origin} on actor!`
                )
            })
            return api
        },

        hasHp(expectedHp, variant)
        {
            safe(() =>
            {
                const actualHp = actor.system?.attributes?.hp?.[variant]
                assert.equal(
                    actualHp,
                    expectedHp,
                    `Expected hp(${expectedHp}) of type ${variant} was not equal to actual hp(${actualHp})!`
                )
            })
            return api
        },

        hasAc(expectedAc)
        {
            safe(() =>
            {
                const actualAc = actor.system.attributes.ac.value
                assert.equal(
                    actualAc,
                    expectedAc,
                    `Expected ac(${expectedAc}) was not equal to actual ac(${expectedAc})!`
                )
            })
            return api
        },

        hasMovementBonus(expectedMovementBonus)
        {
            safe(() =>
            {
                const actual = actor.system?.attributes?.movement?.bonus
                assert.equal(
                    String(actual),
                    String(expectedMovementBonus),
                    `expected movement bonus(${expectedMovementBonus}) was not equal to actual movement bonus(${actual})`
                )
            })
            return api
        },

        hasMovementSpeed(expectedMovementSpeed, type = "walk")
        {
            safe(() =>
            {
                const actual = actor.system.attributes.movement[type]
                assert.equal(
                    String(actual),
                    String(expectedMovementSpeed),
                    `expected movement(${expectedMovementSpeed}) for type(${type}) was not equal to actual movement bonus(${actual})`
                )
            })
            return api
        },

        hasDisadvantage(identifier, type = null)
        {
            safe(() =>
            {
                const roll = resolveRollMode(identifier, type)
                assert.equal(
                    roll?.mode,
                    -1,
                    `Actor does not have disadvantage on identifier(${identifier}) and roll type(${type})`
                )
            })
            return api
        },

        hasToolsDisadvantage()
        {
            safe(() =>
            {
                assert.isTrue(
                    actor.flags["midi-qol"].disadvantage.tool.all,
                    `Midi - qol flag for all tool disadvantage was not set to true!`
                )
            })
            return api
        },

        hasAdvantage(identifier, type = null)
        {
            safe(() =>
            {
                const rollMode = resolveRollMode(identifier, type)
                assert.equal(
                    rollMode?.value,
                    1,
                    `Actor does not have advantage on identifier(${identifier}) and roll type(${type})`
                )
            })
            return api
        },

        hasExhaustionLevel(expected)
        {
            safe(() =>
            {
                const actual = actor.system?.attributes?.exhaustion
                assert.equal(
                    actual,
                    expected,
                    `Actor does not have exhaustion level equal to expected!(${expected} != ${actual})`
                )
            })
            return api
        },

        hasDeathSaves(expectedDelta)
        {
            safe(() =>
            {
                const death = actor.system?.attributes?.death
                const delta = (death?.success ?? 0) - (death?.failure ?? 0)
                assert.equal(
                    delta,
                    expectedDelta,
                    `Actor does not have death save delta equal to expected(${expectedDelta} != ${delta}), successes: ${death.success}, failures: ${death.failure} `
                )
            })
            return api
        },

        hasDamageResistances(expecetdResistances)
        {
            safe(() =>
            {
                const resistances = actor.system.traits.dr.value
                const actual = Array.from(resistances)

                assert.deepEqual(
                    actual.sort(),
                    expecetdResistances.sort(),
                    `Expected resistances to contain "${expecetdResistances.join(", ")}"`
                )
            })
            return api
        },

        notHasDamageResistances(expectedNotResistances)
        {
            safe(() =>
            {
                const resistances = actor.system.traits.dr.value
                const actual = Array.from(resistances)

                assert.ok(
                    expectedNotResistances.every(r => !actual.includes(r)),
                    `Expected none of [${expectedNotResistances.join(", ")}] to be present, but found: ${expectedNotResistances.filter(r => actual.includes(r)).join(", ")
                    }`
                )
            })
            return api
        },

        validateNumberOfDamageResistances(expectedNumberOfResistances)
        {
            safe(() =>
            {
                const actualNumberOfResistances = actor.system.traits.dr.value.size
                assert.equal(
                    actualNumberOfResistances,
                    expectedNumberOfResistances,
                    `Expected number of damage resistances (${expectedNumberOfResistances}) did not match actual number of resistances (${actualNumberOfResistances})`
                )
            })
            return api
        },

        validateActorOnceFlag(onceFlag, expectedValue)
        {
            safe(() =>
            {
                const flagValue = actor.flags.transformations.once[onceFlag]
                assert.deepEqual(
                    flagValue,
                    expectedValue,
                    `Expected once flag value (${expectedValue}) did not match actual once flag value (${flagValue})`
                )
            })
            return api
        },

        validateActorOnceFlagDoesNotExist()
        {
            safe(() =>
            {
                const actorTransformationsFlags = actor.flags.transformations
                assert.equal(
                    actorTransformationsFlags.once,
                    undefined,
                    `Once flag exist (${actorTransformationsFlags.once?.join(", ")})`
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

            assert.fail(
                "Roll type must be provided for ability checks"
            )
        }

        // Attributes
        if (attributeValues.includes(identifier)) {
            return system.attributes?.[identifier]?.roll
        }

        return null
    }

    return api
}
