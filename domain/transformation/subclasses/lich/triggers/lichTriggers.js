import { onBloodied } from "./onBloodied.js"
import { onConcentration } from "./onConcentration.js"
import { onLongRest } from "./onLongRest.js"
import { onPreRollDamage } from "./onPreRollDamage.js"
import { onUnconscious } from "./onUnconscious.js"

export const lichTriggers = {
    [onBloodied.name]: onBloodied,
    [onConcentration.name]: onConcentration,
    [onLongRest.name]: onLongRest,
    [onPreRollDamage.name]: onPreRollDamage,
    [onUnconscious.name]: onUnconscious
}
