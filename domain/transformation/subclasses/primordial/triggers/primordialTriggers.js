import { onActivityUse } from "./onActivityUse.js"
import { onBloodied } from "./onBloodied.js"
import { onConditionApplied } from "./onConditionApplied.js"
import { onLongRest } from "./onLongRest.js"
import { onUnconscious } from "./onUnconscious.js"

export const primordialTriggers = {
    [onActivityUse.name]: onActivityUse,
    [onBloodied.name]: onBloodied,
    [onConditionApplied.name]: onConditionApplied,
    [onLongRest.name]: onLongRest,
    [onUnconscious.name]: onUnconscious
}
