export function createDependencies({
    game,
    constants,
    utils,
    logger
})
{
    logger.debug("createDependencies", {
        game,
        constants,
        utils
    })

    return {
        game,
        constants,
        utils,
        logger
    }
}
