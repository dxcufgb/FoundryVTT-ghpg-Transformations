export function createSocketGateway({
    getGame,
    logger,
    isGM
}) {
    let socket = null;

    function setSocket(s) {
        socket = s;
    }

    function canMutateLocally() {
        return isGM();
    }


    function isGMOnline() {
        return getGame().users.some(u => u.isGM && u.active);
    }

    function executeAsGM(type, payload) {
        if (!socket) {
            throw new Error("Socket not ready");
        }
        return socket.executeAsGM(type, payload);
    }

    function register(event, handler) {
        if (!socket) {
            throw new Error(
                `Socket not initialized. Cannot register '${event}'`
            );
        }

        socket.register(event, handler);
        logger.debug("Socket handler registered", event);
    }

    return Object.freeze({
        setSocket,
        canMutateLocally,
        executeAsGM,
        isGMOnline,
        register
    });
}