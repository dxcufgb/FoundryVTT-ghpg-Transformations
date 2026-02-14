import { AberrantHorror as AberrantHorrorClass } from "./AberrantHorror.js";
import { AberrantHorrorDefinition } from "./AberrantHorrorDefinition.js";
import { aberrantHorrorStages } from "./stages/aberrantHorrorStages.js";
import { aberrantHorrorEffects } from "./effects/index.js";
import { aberrantHorrorMacros } from "./macros.js";
import { createAberrantHorrorMacroHandlers } from "./macros/handlers.js";
import { aberrantHorrorTriggers } from "./triggers/aberrantHorrorTriggers.js";

export const AberrantHorror = Object.freeze({
    Class: AberrantHorrorClass,
    Definition: AberrantHorrorDefinition,
    Stages: aberrantHorrorStages,
    Triggers: aberrantHorrorTriggers,
    Effects: aberrantHorrorEffects,
    Macros: aberrantHorrorMacros,
    handlers: {
        type: AberrantHorrorClass.type,
        createMacroHandlers: createAberrantHorrorMacroHandlers
    }
});