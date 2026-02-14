export function createCurrentActorResolver({ game, canvas }) {

    function resolve(name = null) {
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