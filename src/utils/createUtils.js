import { EffectChangeBuilder } from "./EffectChangeBuilder.js"
import { enumUtils } from "./enumUtils.js"
import { ErrorUtils } from "./errorUtils.js"
import { objectUtils } from "./objectUtils.js"
import { stringUtils } from "./stringUtils.js"
import { ASYNC_TRACKER_DOMAINS } from "./asyncTracking/asyncTrackerDomains.js"
import { createAsyncTrackerRegistry } from "./asyncTracking/asyncTrackingRegistry.js"

export function createUtils({
    constants,
    logger
})
{
    return Object.freeze({
        effectChangeBuilder: new EffectChangeBuilder({
            constants,
            logger
        }),
        stringUtils: stringUtils({ logger }),
        objectUtils: objectUtils({ logger }),
        enumUtils: enumUtils({ logger }),
        ErrorUtils: ErrorUtils({ logger }),
        asyncTrackers: createAsyncTrackerRegistry({ logger }),
        asyncTrackerDomains: ASYNC_TRACKER_DOMAINS
    })
}