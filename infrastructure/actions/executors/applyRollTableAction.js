export async function applyRollTableAction({
    actor,
    data,
    context,
    logger
}) {
    if (!data?.uuid) return;

    const table = await fromUuid(data.uuid);
    if (!table) {
        logger?.warn?.(
            "RollTable not found",
            data.uuid
        );
        return;
    }

    const mode = data.mode ?? "roll";
    const resultsCount = data.results ?? 1;
    const displayChat = data.displayChat ?? false;

    logger?.debug?.(
        "Applying roll table action",
        table.description,
        { mode, resultsCount, context }
    );

    let results = [];

    if (resultsCount > 1) {
        const draw = await table.drawMany(resultsCount, { displayChat: displayChat });
        results = draw.results;
    } else {
        // default roll mode
        for (let i = 0; i < resultsCount; i++) {
            const roll = await table.draw({ displayChat: displayChat });
            if (roll?.results?.length) {
                results.push(...roll.results);
            }
        }
    }

    // Optional constraint: only lower than current
    if (data.onlyLowerThanCurrent) {
        const current = actor.getFlag("transformations", "currentRollTableScore") ?? Infinity;

        results = results.filter(r => {
            const value = Number(r.range?.[1] ?? r.weight);
            return value < current;
        });

        if (!results.length) {
            logger?.debug?.(
                "No roll table results passed lower-than-current constraint"
            );
            return;
        }
    }

    // Optional persistence
    if (data.storeResultFlag && results.length) {
        await actor.setFlag(
            "transformations",
            data.storeResultFlag,
            results.map(r => ({
                id: r.id,
                name: r.name,
                text: r.description,
                range: r.range
            }))
        );
    }

    return results;
}
