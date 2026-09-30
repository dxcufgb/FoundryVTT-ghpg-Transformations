import { onBloodied } from "./onBloodied.js"
import { onConcentration } from "./onConcentration.js"
import { onLongRest } from "./onLongRest.js"
import { onUnconscious } from "./onUnconscious.js"
import { onSkillCheck } from "./onSkillCheck.js";

// Fiend Form is only revealed through the GM-called Con save triggers
// (bloodied, concentration, unconscious); saving throws do not reveal it.
export const fiendTriggers = {
    [onSkillCheck.name]: onSkillCheck,
    [onBloodied.name]: onBloodied,
    [onConcentration.name]: onConcentration,
    [onLongRest.name]: onLongRest,
    [onUnconscious.name]: onUnconscious
}