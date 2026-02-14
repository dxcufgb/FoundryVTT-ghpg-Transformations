import { onBloodied } from "./onBloodied.js";
import { onConcentration } from "./onConcentration.js";
import { onDamage } from "./onDamage.js";
import { onHitDieRoll } from "./onHitDieRoll.js";
import { onInitiative } from "./onInitiative.js";
import { onLongRest } from "./onLongRest.js";
import { onSavingThrow } from "./onSavingThrow.js";
import { onShortRest } from "./onShortRest.js";
import { onUnconscious } from "./onUnconscious.js";

export const aberrantHorrorTriggers = {
    [onBloodied.name]: onBloodied,
    [onConcentration.name]: onConcentration,
    [onDamage.name]: onDamage,
    [onHitDieRoll.name]: onHitDieRoll,
    [onInitiative.name]: onInitiative,
    [onLongRest.name]: onLongRest,
    [onSavingThrow.name]: onSavingThrow,
    [onShortRest.name]: onShortRest,
    [onUnconscious.name]: onUnconscious,
};