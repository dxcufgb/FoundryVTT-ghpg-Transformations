export function canShowTransformationControls({
    app,
    game,
    ActorClass,
    logger = null
})
{
    logger?.debug?.("canShowTransformationControls", { app, game, ActorClass })
    if (!game.user.isGM) return false
    if (!(app.document instanceof ActorClass)) return false
    if (!app.actor) return false
    if (app.actor.type !== "character") return false

    return true
}
