import { RuleRegistry } from "./RuleRegistry.js"

/**
 * Scalar equality
 */
RuleRegistry.register("equals", ({ expected, actual, path, assert }) =>
{
    console.debug("Rule: equals called", expected, actual, path, assert)
    assert.equal(
        actual,
        expected,
        `[${path}] Expected ${expected} but got ${actual}`
    )
})

/**
 * Deep equality
 */
RuleRegistry.register("deepEquals", ({ expected, actual, path, assert }) =>
{
    console.debug("Rule: deepEquals called", expected, actual, path, assert)
    assert.deepEqual(
        actual,
        expected,
        `[${path}] Deep equality mismatch`
    )
})

/**
 * Greater than
 */
RuleRegistry.register("greaterThan", ({ expected, actual, path, assert }) =>
{
    console.debug("Rule: greaterThan called", expected, actual, path, assert)
    assert.isTrue(
        actual > expected,
        `[${path}] Expected ${actual} to be > ${expected}`
    )
})

/**
 * Less than
 */
RuleRegistry.register("lessThan", ({ expected, actual, path, assert }) =>
{
    console.debug("Rule: lessThan called", expected, actual, path, assert)
    assert.isTrue(
        actual < expected,
        `[${path}] Expected ${actual} to be < ${expected}`
    )
})

/**
 * Includes
 */
RuleRegistry.register("includes", ({ expected, actual, path, assert }) =>
{
    console.debug("Rule: includes called", expected, actual, path, assert)
    assert.isTrue(
        actual.includes(expected),
        `[${path}] Expected ${JSON.stringify(actual)} to include ${expected}`
    )
})

/**
 * Equals array (order independent)
 */
RuleRegistry.register("equalsArray", ({ expected, actual, path }) =>
{
    console.debug("Rule: equalsArray called", expected, actual, path)

    const expectedArr = [...expected]
    const actualArr = [...actual]

    const missing = expectedArr.filter(e => !actualArr.includes(e))
    const unexpected = actualArr.filter(a => !expectedArr.includes(a))

    if (
        expectedArr.length !== actualArr.length ||
        missing.length ||
        unexpected.length
    ) {
        throw new Error(
            `[${path}] Array mismatch\n` +
            `Expected:   ${JSON.stringify(expectedArr)}\n` +
            `Actual:     ${JSON.stringify(actualArr)}\n` +
            `Missing:    ${JSON.stringify(missing)}\n` +
            `Unexpected: ${JSON.stringify(unexpected)}`
        )
    }
})

/**
 * Includes all (subset)
 */
RuleRegistry.register("includesAll", ({ expected, actual, path }) =>
{
    console.debug("Rule: includesAll called", expected, actual, path)
    const actualArr = Array.isArray(actual)
        ? actual
        : Array.from(actual ?? [])

    const expectedArr = Array.isArray(expected)
        ? expected
        : expected?.values ?? []

    const missing = expectedArr.filter(e => !actualArr.includes(e))

    if (missing.length) {
        throw new Error(
            `[${path}] Missing values: ${JSON.stringify(missing)}\n` +
            `Actual: ${JSON.stringify(actualArr)}`
        )
    }
})

/**
 * Not includes any
 */
RuleRegistry.register("notIncludesAny", ({ expected, actual, path }) =>
{
    console.debug("Rule: notIncludesAny called", expected, actual, path)

    const expectedArr = [...expected]
    const actualArr = [...actual]

    const found = expectedArr.filter(e => actualArr.includes(e))

    if (found.length) {
        throw new Error(
            `[${path}] Unexpected values present: ${JSON.stringify(found)}`
        )
    }
})

RuleRegistry.register("effectsMatch", ({ expected, actual, path }) =>
{
    if (!expected) return

    const { expected: expectedCount, matchMode = "or", filters = [] } = expected

    const matches = actual.filter(effect =>
    {
        if (matchMode === "and") {
            return filters.every(f => effect[f.key] === f.value)
        }

        return filters.some(f => effect[f.key] === f.value)
    })

    const count = matches.length

    if (count !== expectedCount) {
        throw new Error(
            `[${path}] Expected ${expectedCount} matching effects but found ${count}\n` +
            `Filters: ${JSON.stringify(filters)}\n` +
            `Matched: ${matches.map(e => e.name).join(", ")}`
        )
    }
})

RuleRegistry.register("indexedStringMatch", ({ expected, actual, path }) =>
{
    console.debug("Rule: indexedStringMatch called", expected, actual, path)
    if (!expected?.values) return

    const { values, mode } = expected

    values.forEach((val, index) =>
    {
        const actualValue = actual[index] ?? ""

        if (mode === "includes") {
            if (!actualValue.includes(val)) {
                throw new Error(
                    `[${path}] Expected value at index ${index} to include "${val}" but got "${actualValue}"`
                )
            }
        }
        else if (mode === "equal") {
            if (actualValue !== val) {
                throw new Error(
                    `[${path}] Expected value "${val}" but got "${actualValue}"`
                )
            }
        }
        else {
            throw new Error(
                `[${path}] Unknown match mode "${mode}"`
            )
        }
    })
})

RuleRegistry.register("indexedMatch", ({ expected, actual, path }) =>
{
    console.debug("Rule: indexedMatch called", expected, actual, path)
    if (!expected?.values) return

    const { values, mode } = expected

    values.forEach((exp, index) =>
    {
        const act = actual?.[index]

        if (mode === "equal") {
            if (JSON.stringify(act) !== JSON.stringify(exp)) {
                throw new Error(
                    `[${path}] Value mismatch at index ${index}\n` +
                    `Expected: ${JSON.stringify(exp)}\n` +
                    `Actual:   ${JSON.stringify(act)}`
                )
            }
        }
        else if (mode === "includes") {
            if (!act?.includes?.(exp)) {
                throw new Error(
                    `[${path}] Value at index ${index} did not include "${exp}".\n` +
                    `Actual: ${JSON.stringify(act)}`
                )
            }
        }
        else {
            throw new Error(`[${path}] Unknown match mode "${mode}"`)
        }
    })
})

RuleRegistry.register("allRollModes", ({ expected, actual, path }) =>
{
    if (!expected?.length) return

    actual.forEach((mode, index) =>
    {
        if (mode !== expected[index].mode) {
            throw new Error(
                `[${path}] Roll mode mismatch at index ${index}. ` +
                `Expected ${expected[index].mode} but got ${mode}`
            )
        }
    })
})