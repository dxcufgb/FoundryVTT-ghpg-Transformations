import { onBloodied } from "./onBloodied.js"
import { onConcentration } from "./onConcentration.js"
import { onLongRest } from "./onLongRest.js"
import { onPreRollDamage } from "./onPreRollDamage.js"
import { onZeroHp } from "./onZeroHp.js"

export const shadowsteelGhoulTriggers = {
    [onBloodied.name]: onBloodied,
    [onConcentration.name]: onConcentration,
    [onLongRest.name]: onLongRest,
    [onPreRollDamage.name]: onPreRollDamage,
    [onZeroHp.name]: onZeroHp
}
