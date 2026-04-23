import { onActivityUse } from "./onActivityUse.js"
import { onBloodied } from "./onBloodied.js"
import { onConcentration } from "./onConcentration.js"
import { onLongRest } from "./onLongRest.js"
import { onUnconscious } from "./onUnconscious.js"

export const seraphTriggers = {
    [onActivityUse.name]: onActivityUse,
    [onBloodied.name]: onBloodied,
    [onConcentration.name]: onConcentration,
    [onLongRest.name]: onLongRest,
    [onUnconscious.name]: onUnconscious
}
