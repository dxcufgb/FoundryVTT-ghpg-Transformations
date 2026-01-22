export async function applyMacroAction({
    actor,
    data,
    context,
    logger
}) {
    const actorUuid = await actor.uuid;
    const token = actor.getActiveTokens(true)[0];
    const tokenUuid = token?.document.uuid;
    await game.transformations.macroWrapper({
        transformationType: data.transformationType,
        action: data.action,
        trigger: data.trigger,
        args: {
            actorUuid: actorUuid,
            tokenUuid: tokenUuid,
        }
    });
}