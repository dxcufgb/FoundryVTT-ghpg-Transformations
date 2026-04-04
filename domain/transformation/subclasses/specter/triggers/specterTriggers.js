import { onBloodied } from "./onBloodied.js"
import { onConcentration } from "./onConcentration.js"
import { onLongRest } from "./onLongRest.js"

export const specterTriggers = {
    [onBloodied.name]: onBloodied,
    [onConcentration.name]: onConcentration,
    [onLongRest.name]: onLongRest
}
