export function createSocketGateway({
    tracker,
    getGame,
    getExecutor,
    logger
})
{
    let socket = null
    const queue = []

    function enqueue({ action, payload })
    {
        queue.push({ action, payload })
        logger.debug("Queued GM action", { action, payload })
    }

    async function flushQueue()
    {
        if (!queue.length) return

        logger.debug(`Flushing ${queue.length} GM actions`)

        return tracker.track(
            (async () =>
            {
                while (queue.length) {
                    const { action, payload } = queue.shift()
                    await getExecutor().execute(action, payload)
                }
            })()
        )
    }
    function setSocket(s)
    {
        socket = s
    }

    function canMutateLocally()
    {
        return getGame().user?.isGM === true
    }


    function isGMOnline()
    {
        return getGame().users.some(u => u.isGM && u.active)
    }

    function executeAsGM(type, payload)
    {
        if (!socket) {
            throw new Error("Socket not ready")
        }
        return socket.executeAsGM(type, payload)
    }

    function register(event, handler)
    {
        if (!socket) {
            throw new Error(
                `Socket not initialized. Cannot register '${event}'`
            )
        }

        socket.register(event, handler)
        logger.debug("Socket handler registered", event)
    }

    function isReady()
    {
        return socket !== null
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        setSocket,
        canMutateLocally,
        executeAsGM,
        isGMOnline,
        register,
        isReady,
        enqueue,
        flushQueue
    })
}
