// services/triggers/triggerVariableResolver.js
export function createTriggerVariableResolver({
    actorRepository,
    formulaEvaluator,
    logger
})
{
    logger.debug("createTriggerVariableResolver", {
        actorRepository,
        formulaEvaluator
    })

    function resolve({
        actor,
        transformation,
        rawVariables,
        context
    })
    {
        logger.debug("createTriggerVariableResolver.resolve", {
            actor,
            transformation,
            rawVariables,
            context
        })
        if (!Array.isArray(rawVariables) || rawVariables.length === 0) {
            return {}
        }

        const resolved = {}

        for (const variable of rawVariables) {
            try {
                resolved[variable.name] = resolveVariable({
                    variable,
                    actor,
                    transformation,
                    context,
                    resolved
                })
            } catch (err) {
                logger.error(
                    "Failed to resolve trigger variable",
                    {
                        variable,
                        actorId: actor?.id,
                        transformationId: transformation?.definition?.id,
                        context,
                        err
                    }
                )
            }
        }

        return resolved
    }

    return Object.freeze({resolve})

    function resolveVariable({
        variable,
        actor,
        transformation,
        context,
        resolved
    })
    {
        logger.debug("createTriggerVariableResolver.resolveVariable", {
            variable,
            actor,
            transformation,
            context,
            resolved
        })
        switch (variable.type) {
            case "formula":
                return formulaEvaluator.evaluate({
                    formula: variable.value,
                    scope: buildScope({
                        actor,
                        transformation,
                        context,
                        variables: resolved
                    })
                })

            case "static":
                return variable.value

            case "highestAvailableHitDiceMax":
                return getHitDiceMax(actor)

            case "stageDependent":
                return variable?.value?.[
                    actor?.flags?.transformations?.stage
                    ] ?? 0

            default:
                throw new Error(
                    `Unknown trigger variable type: ${variable.type}`
                )
        }
    }

    function buildScope({
        actor,
        transformation,
        context,
        variables
    })
    {
        logger.debug("createTriggerVariableResolver.buildScope", {
            actor,
            transformation,
            context,
            variables
        })
        return {
            actor,
            transformation,
            context,
            variables,

            // Common shorthands
            highestAvailableHitDiceMax: getHitDiceMax(actor),
            prof: actor?.system?.attributes?.prof ?? 0,
            stage: transformation?.stage ?? 0
        }
    }

    function getHitDiceMax(actor)
    {
        logger.debug("createTriggerVariableResolver.getHitDiceMax", {
            actor
        })

        const maximumHitDices = actorRepository?.getMaximumHitDices?.(actor)

        return Number(maximumHitDices ?? 0)
    }

}
