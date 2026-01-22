import { enumUtils } from "./enumUtils.js";
import { ErrorUtils } from "./errorUtils.js";
import { objectUtils } from "./objectUtils.js";
import { stringUtils } from "./stringUtils.js";

export function createUtils({
    logger
}) {
    return Object.freeze({
        stringUtils: stringUtils({ logger }),
        objectUtils: objectUtils({ logger }),
        enumUtils: enumUtils({ logger }),
        ErrorUtils: ErrorUtils({ logger })
    })
}