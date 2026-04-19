export function createSocketGateway({
    tracker,
    getGame,
    getExecutor,
    logger
})
{
    logger.debug("createSocketGateway", {
        tracker,
        getGame,
        getExecutor
    })

    let socket = null
    const queue = []

    function enqueue({ action, payload })
    {
        logger.debug("createSocketGateway.enqueue", { action, payload })
        queue.push({ action, payload })
        logger.debug("Queued GM action", { action, payload })
    }

    async function flushQueue()
    {
        logger.debug("createSocketGateway.flushQueue", { queueLength: queue.length })
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
        logger.debug("createSocketGateway.setSocket", { s })
        socket = s
    }

    function canMutateLocally()
    {
        logger.debug("createSocketGateway.canMutateLocally", {})
        return getGame().user?.isGM === true
    }


    function isGMOnline()
    {
        logger.debug("createSocketGateway.isGMOnline", {})
        return getGame().users.some(u => u.isGM && u.active)
    }

    function executeAsGM(type, payload)
    {
        logger.debug("createSocketGateway.executeAsGM", { type, payload })
        if (!socket) {
            throw new Error("Socket not ready")
        }
        return socket.executeAsGM(type, payload)
    }

    function executeAsUser(type, userId, payload)
    {
        logger.debug("createSocketGateway.executeAsUser", {
            type,
            userId,
            payload
        })
        if (!socket) {
            throw new Error("Socket not ready")
        }
        return socket.executeAsUser(type, userId, payload)
    }

    function register(event, handler)
    {
        logger.debug("createSocketGateway.register", { event, handler })
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
        logger.debug("createSocketGateway.isReady", {})
        return socket !== null
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        setSocket,
        canMutateLocally,
        executeAsGM,
        executeAsUser,
        isGMOnline,
        register,
        isReady,
        enqueue,
        flushQueue
    })
}
