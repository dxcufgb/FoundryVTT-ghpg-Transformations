export function createNotifier({
    notifications,
    logger
})
{
    logger?.debug?.("createNotifier", {})
    return {
        info: message =>
        {
            logger?.debug?.("createNotifier.info", { message })
            return notifications().info(message)
        },
        warn: message =>
        {
            logger?.debug?.("createNotifier.warn", { message })
            return notifications().warn(message)
        },
        error: message =>
        {
            logger?.debug?.("createNotifier.error", { message })
            return notifications().error(message)
        }
    }
}
