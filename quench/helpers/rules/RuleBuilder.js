import { getByPath } from "./getByPath.js"
import { RuleRegistry } from "./RuleRegistry.js"

// @ts-check

export function path(p)
{
    return createBuilder(new RuleBuilder({ path: p }))
}

export function resolve(fn)
{
    return createBuilder(new RuleBuilder({ resolve: fn }))
}

/**
 * Wrap builder in Proxy so RuleRegistry rules become DSL methods
 */
function createBuilder(builder)
{
    return new Proxy(builder, {
        get(target, prop)
        {
            if (prop in target)
                return target[prop]

            if (RuleRegistry.has(prop)) {
                return () => target.build(prop)
            }

            return undefined
        }
    })
}

class RuleBuilder
{
    constructor (config)
    {
        this.config = config
        this.transforms = []
        this.filters = []
    }

    // ------------------------------------------------
    // FILTERS
    // ------------------------------------------------

    where(key, value)
    {
        this.filters.push((item) =>
            getByPath(item, key) === value
        )
        return this
    }

    whereIncludes(key, value)
    {
        this.filters.push(item =>
        {
            const actual = getByPath(item, key)

            if (Array.isArray(actual))
                return actual.includes(value)

            if (actual instanceof Set)
                return actual.has(value)

            return false
        })

        return this
    }

    whereOrigin()
    {
        this.filters.push((item, expected) =>
        {
            if (!expected || !expected.origin)
                return true

            return item?.origin === expected.origin
        })

        return this
    }

    whereFn(fn)
    {
        this.filters.push(fn)
        return this
    }

    // ------------------------------------------------
    // TRANSFORMS
    // ------------------------------------------------

    filter(fn)
    {
        this.transforms.push(arr =>
            Array.isArray(arr) ? arr.filter(fn) : arr
        )
        return this
    }

    map(fn)
    {
        this.transforms.push(arr =>
            Array.isArray(arr) ? arr.map(fn) : arr
        )
        return this
    }

    pluck(propertyPath)
    {
        this.transforms.push(arr =>
            Array.isArray(arr)
                ? arr.map(v => getByPath(v, propertyPath))
                : arr
        )
        return this
    }

    pluckFlag(flagPath)
    {
        return this.map(obj =>
            getByPath(obj.flags ?? {}, flagPath)
        )
    }

    toArray()
    {
        this.transforms.push(v =>
            Array.isArray(v) ? v : Array.from(v ?? [])
        )
        return this
    }

    unique()
    {
        this.transforms.push(arr =>
            Array.isArray(arr) ? [...new Set(arr)] : arr
        )
        return this
    }

    first()
    {
        this.transforms.push(arr =>
            Array.isArray(arr) ? arr[0] : arr
        )
        return this
    }

    count()
    {
        this.transforms.push(arr =>
            Array.isArray(arr) ? arr.length : 0
        )
        return this
    }

    // ------------------------------------------------
    // PIPELINE EXECUTION
    // ------------------------------------------------

    resolveValue(ctx, expected)
    {
        let value = this.config.resolve
            ? this.config.resolve(ctx, expected)
            : getByPath(ctx, this.config.path)

        if (Array.isArray(value) && this.filters.length) {
            value = value.filter(item =>
                this.filters.every(f =>
                    typeof f === "function"
                        ? f(item, expected)
                        : f(item)
                )
            )
        }

        for (const t of this.transforms)
            value = t(value)

        return value
    }

    // ------------------------------------------------
    // RULE BUILD
    // ------------------------------------------------

    build(type)
    {
        return {
            resolve: (ctx, expected) =>
                this.resolveValue(ctx, expected),

            type
        }
    }
}