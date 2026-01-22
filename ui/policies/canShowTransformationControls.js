export function canShowTransformationControls({
    app,
    ActorClass
}) {
    if (!(app.document instanceof ActorClass)) return false;
    if (!app.actor) return false;
    if (app.actor.type !== "character") return false;

    return true;
}