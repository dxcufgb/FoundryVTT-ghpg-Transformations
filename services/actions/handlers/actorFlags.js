import { resolveValue } from "../utils/resolveValue.js"

export function createActorFlagAction({
    tracker,
    logger
})
{
    logger.debug("createActorFlagAction", { tracker })

    return async function ACTOR_FLAG({
        actor,
        action,
        context,
        variables
    })
    {
        const { mode, key, path, value, valuePath, expression } = action.data ?? {}
        const unresolved = Symbol("unresolved")

        const scope = "transformations"

        return tracker.track(
            (async () =>
            {

                if (!actor) {
                    logger.warn("ACTOR_FLAG: Missing actor")
                    return false
                }

                switch (mode) {

                    case "set": {
                        const flagKey = resolveFlagKey({
                            key,
                            path,
                            scope
                        })

                        if (!flagKey) {
                            logger.warn(
                                "ACTOR_FLAG.set: Missing key or supported path",
                                action
                            )
                            return false
                        }

                        const actorPath = resolveActorPath({
                            key,
                            path,
                            scope
                        })
                        const currentValue =
                            actorPath != null
                                ? foundry.utils.getProperty(actor, actorPath)
                                : undefined

                        const nextValue = resolveSetValue({
                            actor,
                            context,
                            variables,
                            currentValue,
                            value,
                            valuePath,
                            expression
                        })

                        if (nextValue === unresolved) {
                            logger.warn(
                                "ACTOR_FLAG.set: Missing value, valuePath, or expression",
                                action
                            )
                            return false
                        }

                        await actor.setFlag(scope, flagKey, nextValue)
                        return true
                    }

                    case "remove": {
                        const flagKey = resolveFlagKey({
                            key,
                            path,
                            scope
                        })

                        if (!flagKey) {
                            logger.warn(
                                "ACTOR_FLAG.remove: Missing key or supported path",
                                action
                            )
                            return false
                        }

                        await actor.unsetFlag(scope, flagKey)
                        return true
                    }

                    case "check": {
                        const actorPath = resolveActorPath({
                            key,
                            path,
                            scope
                        })

                        if (!actorPath) {
                            logger.warn(
                                "ACTOR_FLAG.check: Missing key or path",
                                action
                            )
                            return false
                        }

                        const currentValue = foundry.utils.getProperty(
                            actor,
                            actorPath
                        )

                        if (currentValue == null) {
                            return false
                        }

                        if (expression != null) {
                            return evaluateExpression({
                                actor,
                                context,
                                variables,
                                currentValue,
                                expression
                            })
                        }

                        if (value === undefined && valuePath == null) {
                            return true
                        }

                        const expectedValue =
                            valuePath != null
                                ? resolveValueFromPath({
                                    actor,
                                    context,
                                    valuePath
                                })
                                : value

                        return matchesExpectedValue(
                            currentValue,
                            expectedValue
                        )
                    }

                    default:
                        logger.warn("Unknown ACTOR_FLAG mode", mode, action)
                        return false
                }
            })()
        )

        function resolveFlagKey({
            key,
            path,
            scope
        })
        {
            if (typeof key === "string" && key.length > 0) {
                return key
            }

            if (typeof path !== "string" || path.length === 0) {
                return null
            }

            const fullPrefix = `flags.${scope}.`
            if (path.startsWith(fullPrefix)) {
                return path.slice(fullPrefix.length)
            }

            const shortPrefix = `${scope}.`
            if (path.startsWith(shortPrefix)) {
                return path.slice(shortPrefix.length)
            }

            return path
        }

        function resolveActorPath({
            key,
            path,
            scope
        })
        {
            if (typeof path === "string" && path.length > 0) {
                if (path.startsWith("flags.")) {
                    return path
                }

                const shortPrefix = `${scope}.`
                if (path.startsWith(shortPrefix)) {
                    return `flags.${path}`
                }

                return `flags.${scope}.${path}`
            }

            if (typeof key === "string" && key.length > 0) {
                return `flags.${scope}.${key}`
            }

            return null
        }

        function resolveValueFromPath({
            actor,
            context,
            valuePath
        })
        {
            if (typeof valuePath !== "string" || valuePath.length === 0) {
                return undefined
            }

            const normalizedPath =
                valuePath.startsWith("@")
                    ? valuePath.slice(1)
                    : valuePath

            return foundry.utils.getProperty(
                {
                    actor,
                    context
                },
                normalizedPath
            )
        }

        function matchesExpectedValue(currentValue, expectedValue)
        {
            if (Array.isArray(currentValue)) {
                if (Array.isArray(expectedValue)) {
                    return expectedValue.every(value =>
                        currentValue.includes(value)
                    )
                }

                return currentValue.includes(expectedValue)
            }

            if (Array.isArray(expectedValue)) {
                return expectedValue.includes(currentValue)
            }

            return currentValue === expectedValue
        }

        function resolveSetValue({
            actor,
            context,
            variables,
            currentValue,
            value,
            valuePath,
            expression
        })
        {
            if (expression != null) {
                return resolveExpressionValue({
                    actor,
                    context,
                    variables,
                    currentValue,
                    expression
                })
            }

            if (valuePath != null) {
                return resolveValueFromPath({
                    actor,
                    context,
                    valuePath
                })
            }

            if (value !== undefined) {
                return value
            }

            return unresolved
        }

        function evaluateExpression({
            actor,
            context,
            variables,
            currentValue,
            expression
        })
        {
            const evaluationResult = resolveExpressionValue({
                actor,
                context,
                variables,
                currentValue,
                expression
            })

            return evaluationResult === true
        }

        function resolveExpressionValue({
            actor,
            context,
            variables,
            currentValue,
            expression
        })
        {
            if (typeof expression !== "string" || expression.length === 0) {
                logger.warn(
                    "ACTOR_FLAG: Invalid expression",
                    expression
                )
                return unresolved
            }

            const evaluationResult = resolveValue(
                expression,
                {
                    actor,
                    context,
                    currentValue,
                    flagValue: currentValue,
                    value: currentValue
                },
                variables,
                logger
            )

            return evaluationResult ?? unresolved
        }
    }
}
