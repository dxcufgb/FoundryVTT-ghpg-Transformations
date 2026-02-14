export function createNotifier({
    notifications
})
{
    return {
        info: message => notifications().info(message),
        warn: message => notifications().warn(message),
        error: message => notifications().error(message)
    }
}