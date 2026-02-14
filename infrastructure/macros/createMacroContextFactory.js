export function createMacroContextFactory({
    logger
})
{
    logger.debug("createMacroContextFactory", {})

    function createFromToken(token)
    {
        logger.debug("createMacroContextFactory.createFromToken", { token })
        if (!token) {
            logger.warn("MacroContextFactory: token missing")
            return null
        }

        const actor = token.actor

        if (!actor) {
            logger.warn(
                "MacroContextFactory: token has no actor",
                token.id
            )
            return null
        }

        return Object.freeze({
            tokenId: token.id,
            actorId: actor.id,
            sceneId: token.scene?.id ?? null,

            position: {
                x: token.x,
                y: token.y
            },

            elevation: token.elevation ?? 0,

            actor: {
                name: actor.name,
                type: actor.type
            }
        })
    }

    return Object.freeze({
        createFromToken
    })
}
