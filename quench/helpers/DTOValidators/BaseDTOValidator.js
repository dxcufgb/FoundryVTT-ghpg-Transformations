import { getByPath } from "../rules/getByPath.js"
import { RuleRegistry } from "../rules/RuleRegistry.js"

/**
 * Base class for all DTO validators.
 * Handles:
 *  - Strict schema enforcement
 *  - Rule resolution
 *  - Comparator dispatch via RuleRegistry
 *  - Path-aware error reporting
 */
// @ts-check
export class BaseDTOValidator
{
    constructor ({ assert, path = "actor", strict = true })
    {
        this.assert = assert
        this.path = path
        this.strict = strict

        this.errors = []
    }

    indexPath(base, index)
    {
        return `${base}[${index}]`
    }

    recordError(message, subPath = null)
    {
        const fullPath = subPath
            ? this.childPath(subPath)
            : this.path

        const finalMessage =
            message.startsWith("[")
                ? message
                : `[${fullPath}] ${message}`

        if (this.soft)
            this.errors.push(finalMessage)
        else
            throw new Error(finalMessage)
    }

    /**
     * Execute rule-based validation
     */
    validate(dto, context)
    {
        this.validateRuleDefinitions()

        const rules = this.constructor.rules ?? {}

        // -----------------------------
        // Rule validation
        // -----------------------------
        for (const [key, expected] of Object.entries(dto)) {
            if (
                expected === null ||
                expected === undefined ||
                (Array.isArray(expected) && expected.length === 0)
            )
                continue

            const rule = rules[key]

            if (!rule)
                continue

            let actual

            try {
                actual = rule.resolve
                    ? rule.resolve(context, expected)
                    : getByPath(context, rule.path)
            }
            catch (err) {
                throw new Error(
                    `[${this.path}.${key}] Failed resolving value: ${err.message}`
                )
            }

            const comparator = RuleRegistry.get(rule.type)

            const compareValue =
                (expected && typeof expected === "object" && "expected" in expected)
                    ? expected.expected
                    : expected

            try {
                comparator({
                    expected: compareValue,
                    actual,
                    path: this.buildPath(key),
                    assert: this.assert
                })
            }
            catch (err) {
                this.recordError(err.message, key)
            }
        }

        // -----------------------------
        // Nested DTO validation
        // -----------------------------
        for (const [key, value] of Object.entries(dto)) {
            if (!value) continue

            const DTOClass = value.constructor
            const ValidatorClass = DTOClass?.validator

            if (!ValidatorClass) continue

            const childValidator = new ValidatorClass({
                assert: this.assert,
                path: `${this.path}.${key}`,
                strict: this.strict,
                soft: this.soft
            })

            childValidator.validate(value, context)

            this.errors.push(...childValidator.errors)
        }
        if (this.errors.length > 0 && !this.soft) {
            throw new Error(this.errors.join("\n"))
        }
    }

    buildPath(segment)
    {
        if (!segment)
            return this.path

        return `${this.path}.${segment}`
    }

    childPath(segment)
    {
        return segment.startsWith("[")
            ? `${this.path}${segment}`
            : `${this.path}.${segment}`
    }

    /**
     * Validate rule definitions once per validator class
     */
    validateRuleDefinitions()
    {
        if (this.constructor.__rulesValidated)
            return

        const rules = this.constructor.rules ?? {}

        for (const [name, rule] of Object.entries(rules)) {
            if (!rule.type) {
                throw new Error(
                    `[${this.path}] Rule "${name}" is missing a "type"`
                )
            }

            if (!rule.resolve && !rule.path) {
                throw new Error(
                    `[${this.path}] Rule "${name}" must define either "resolve" or "path"`
                )
            }

            if (!RuleRegistry.has(rule.type)) {
                throw new Error(
                    `[${this.path}] Rule "${name}" references unknown rule type "${rule.type}"`
                )
            }
        }

        this.constructor.__rulesValidated = true
    }

    /**
     * Strict schema validation:
     * Fails if DTO contains unknown fields.
     */
    validateStrict(dto, supportedFields)
    {
        if (!this.strict) return

        const keys = Object
            .keys(dto)
            .filter(k => dto[k] !== null && dto[k] !== undefined)

        for (const key of keys) {
            if (!supportedFields.includes(key)) {
                throw new Error(
                    `[${this.path}] Unknown DTO field "${key}"`
                )
            }
        }
    }
}