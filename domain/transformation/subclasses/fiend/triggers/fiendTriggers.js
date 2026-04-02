import { onBloodied } from "./onBloodied.js"
import { onConcentration } from "./onConcentration.js"
import { onLongRest } from "./onLongRest.js"
import { onSavingThrow } from "./onSavingThrow.js"
import { onUnconscious } from "./onUnconscious.js"
import { onSkillCheck } from "./onSkillCheck.js";

export const fiendTriggers = {
    [onSkillCheck.name]: onSkillCheck,
    [onBloodied.name]: onBloodied,
    [onConcentration.name]: onConcentration,
    [onLongRest.name]: onLongRest,
    [onSavingThrow.name]: onSavingThrow,
    [onUnconscious.name]: onUnconscious
}