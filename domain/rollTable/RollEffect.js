export async function rollEffect({
    actor,
    rollSource,
    resolver,
    onlyApplyLowerResult = false,
    flagKey,
    removePreviousEffect
}) {
    const result = await rollSource.roll(actor);
    if (!result) return;

    const rollValue = result.roll?.total ?? result.total;
    const previous = actor.getFlag("transformation", flagKey);

    if (
        onlyApplyLowerResult &&
        previous !== undefined &&
        rollValue >= previous
    ) {
        return;
    }

    if (removePreviousEffect) {
        await removePreviousEffect(actor);
    }

    const EffectClass = resolver.resolve(actor, rollValue);
    if (!EffectClass) return;

    const effect = new EffectClass({ actor });
    await effect.apply();

    await actor.setFlag("transformation", flagKey, rollValue);
}
