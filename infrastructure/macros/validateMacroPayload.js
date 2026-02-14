export function validateMacroPayload(payload, { logger }) {
    logger.debug("validateMacroPayload", { payload })
    if (!payload || typeof payload !== "object") {
        logger.warn("Invalid macro payload: not an object", payload);
        return false;
    }

    const {
        args,
        transformationType,
        action,
        trigger
    } = payload;

    if (!args || typeof args !== "object") {
        logger.warn("Invalid macro payload: missing args", payload);
        return false;
    }

    if (typeof args.actorUuid !== "string") {
        logger.warn(
            "Invalid macro payload: actorUuid missing or invalid",
            payload
        );
        return false;
    }

    if (typeof args.tokenUuid !== "string") {
        logger.warn(
            "Invalid macro payload: tokenUuid missing or invalid",
            payload
        );
        return false;
    }

    if (typeof transformationType !== "string") {
        logger.warn(
            "Invalid macro payload: transformationType missing or invalid",
            payload
        );
        return false;
    }

    if (typeof action !== "string") {
        logger.warn(
            "Invalid macro payload: action missing or invalid",
            payload
        );
        return false;
    }

    if (typeof trigger !== "string") {
        logger.warn(
            "Invalid macro payload: trigger missing or invalid",
            payload
        );
        return false;
    }

    return true;
}
