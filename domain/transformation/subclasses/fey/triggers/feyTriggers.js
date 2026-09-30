import { onBloodied } from "./onBloodied.js"
import { onLongRest } from "./onLongRest.js"

export const feyTriggers = {
    [onBloodied.name]: onBloodied,
    [onLongRest.name]: onLongRest
}