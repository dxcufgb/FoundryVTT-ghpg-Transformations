export function createCurrentActorResolver({ game, canvas, logger = null }) {
    logger?.debug?.("createCurrentActorResolver", { game, canvas })

    function resolve(name = null) {
        logger?.debug?.("createCurrentActorResolver.resolve", { name })
        if (name) {
            return game.actors.getName(name);
        }

        return (
            game.user.character ??
            canvas.tokens.controlled[0]?.actor ??
            null
        );
    }

    return {
        resolve
    };
}
