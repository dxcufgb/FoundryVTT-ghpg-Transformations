// infrastructure/rolltables/createRollTableService.js

export function createRollTableService({
    tracker,
    debouncedTracker,
    compendiumRepository,
    logger
})
{
    logger.debug("createRollTableService", {
        tracker,
        debouncedTracker,
        compendiumRepository
    })
    async function roll({
        uuid,
        mode = "normal",
        context = {}
    })
    {
        logger.debug("createRollTableService.roll", {
            uuid,
            mode,
            context
        })
        if (!uuid) {
            logger.warn("rollTableService.roll called without uuid")
            return null
        }

        return tracker.track(
            (async () =>
            {
                const table = await compendiumRepository.getDocumentByUuid(uuid)

                if (!table || table.documentName !== "RollTable") {
                    logger.warn("Invalid RollTable UUID", uuid)
                    return null
                }

                const testOveridenResult = globalThis.__TRANSFORMATIONS_TEST__ === true ? globalThis.___TransformationTestEnvironment___?.rollTableResult : undefined

                const rollResult = await table.draw()
                let result
                if (testOveridenResult != undefined) {
                    result = table.results.find(r =>
                        r.range[0] <= testOveridenResult && r.range[1] >= testOveridenResult
                    )
                } else {
                    result = rollResult?.results?.[0]
                }

                if (!result) {
                    logger.warn("RollTable produced no result", uuid)
                    return null
                }
                const existingKey = result.flags?.transformations?.effectKey

                if (!existingKey) {
                    debouncedTracker.pulse("applyEffectKey")
                    await result.setFlag("transformations", "effectKey", result.name.replaceAll(" ", ""))
                }

                const outcome = normalizeResult({
                    table,
                    rollResult,
                    result,
                    context
                })

                if (!passesMode(outcome, mode, context)) {
                    logger.debug(
                        "RollTable result rejected by mode",
                        { mode, outcome }
                    )
                    return null
                }

                return outcome
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        roll
    })

    function passesMode(outcome, mode, context)
    {
        logger.debug("createRollTableService.passesMode", { outcome, mode, context })
        if (mode === "normal") return true

        const currentStage = context?.currentRollTableEffectLowRange
        const rolledStage = outcome.result.range[1]

        if (currentStage == null || rolledStage == null) {
            return true
        }

        if (mode === "downgradeOnly") {
            return rolledStage <= currentStage
        }

        if (mode === "upgradeOnly") {
            return rolledStage >= currentStage
        }

        return true
    }

    function normalizeResult({ table, rollResult, result, context })
    {
        logger.debug("createRollTableService.normalizeResult", {
            table,
            rollResult,
            result,
            context
        })
        return {
            table: {
                uuid: table.uuid,
                name: table.name
            },

            roll: {
                total: rollResult.roll.total
            },

            result: {
                id: result.id,
                text: result.description,
                img: result.img,
                range: result.range
            },

            effectKey: extractEffectKey(result),

            context
        }
    }

    function extractEffectKey(result)
    {
        logger.debug("createRollTableService.extractEffectKey", { result })
        const flagged = result.flags?.transformations?.effectKey

        if (flagged) return flagged

        // Fallback: [EffectKey] in text
        const text = result?.text ?? ""
        const match = text.match(/\[(.+?)\]/)
        return match ? match[1] : null
    }
}
