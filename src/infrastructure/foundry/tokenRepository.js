export function createTokenRepository({
    logger
}) {
    return {
        getByUuid: async uuid => fromUuid(uuid)
    };
}