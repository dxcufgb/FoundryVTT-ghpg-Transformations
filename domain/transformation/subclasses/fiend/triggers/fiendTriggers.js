import { onBloodied } from "./onBloodied.js"
import { onConcentration } from "./onConcentration.js"
import { onInitiative } from "./onInitiative.js"
import { onLongRest } from "./onLongRest.js"
import { onSavingThrow } from "./onSavingThrow.js"
import { onUnconscious } from "./onUnconscious.js"
import { onAbilityCheck } from "./onAbilityCheck.js";

export const fiendTriggers = {
    [onAbilityCheck.name]: onAbilityCheck,
    [onBloodied.name]: onBloodied,
    [onConcentration.name]: onConcentration,
    [onInitiative.name]: onInitiative,
    [onLongRest.name]: onLongRest,
    [onSavingThrow.name]: onSavingThrow,
    [onUnconscious.name]: onUnconscious
}