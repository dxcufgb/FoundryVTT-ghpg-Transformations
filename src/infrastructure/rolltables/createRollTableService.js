// infrastructure/rolltables/createRollTableService.js

export function createRollTableService({
    compendiumRepository,
    logger
}) {

    async function roll({
        uuid,
        mode = "normal",
        context = {}
    }) {
        if (!uuid) {
            logger.warn("rollTableService.roll called without uuid");
            return null;
        }

        const table = await compendiumRepository.getDocumentByUuid(uuid);

        if (!table || table.documentName !== "RollTable") {
            logger.warn("Invalid RollTable UUID", uuid);
            return null;
        }

        const rollResult = await table.draw();
        const result = rollResult?.results?.[0];

        if (!result) {
            logger.warn("RollTable produced no result", uuid);
            return null;
        }
        const existingKey = result.flags?.transformations?.effectKey;
      
        if (!existingKey) {
            await result.setFlag("transformations", "effectKey", result.name.replaceAll(" ", ""));
        }

        const outcome = normalizeResult({
            table,
            rollResult,
            result,
            context
        });

        if (!passesMode(outcome, mode, context)) {
            logger.debug(
                "RollTable result rejected by mode",
                { mode, outcome }
            );
            return null;
        }

        return outcome;
    }

    return Object.freeze({ roll });

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    function passesMode(outcome, mode, context) {
        if (mode === "normal") return true;

        const currentStage = context?.stage;
        const rolledStage = extractStageFromText(
            outcome.result.text
        );

        if (currentStage == null || rolledStage == null) {
            return true;
        }

        if (mode === "downgradeOnly") {
            return rolledStage <= currentStage;
        }

        if (mode === "upgradeOnly") {
            return rolledStage >= currentStage;
        }

        return true;
    }

    function normalizeResult({ table, rollResult, result, context }) {
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

            // 👇 IMPORTANT: effectKey is just data
            effectKey: extractEffectKey(result),

            context
        };
    }

    function extractEffectKey(result) {
        // Preferred: explicit flag
        const flagged = result.flags?.transformations?.effectKey;

        if (flagged) return flagged;

        // Fallback: [EffectKey] in text
        const text = result?.text ?? "";
        const match = text.match(/\[(.+?)\]/);
        return match ? match[1] : null;
    }

    function extractStageFromText(text = "") {
        const match = text.match(/stage\s*(\d+)/i);
        return match ? Number(match[1]) : null;
    }
}
