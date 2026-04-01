import { Hag as HagClass } from "./Hag.js";
import { HagDefinition } from "./HagDefinition.js";
import { hagStages } from "./stages/hagStages.js";
import { hagEffects } from "./effects/index.js";
import { hagMacros } from "./macros.js";
import { createHagMacroHandlers } from "./macros/handlers.js";
import { hagTriggers } from "./triggers/hagTriggers.js";

export const Hag = Object.freeze({
    Class: HagClass,
    Definition: HagDefinition,
    Stages: hagStages,
    Triggers: hagTriggers,
    Effects: hagEffects,
    Macros: hagMacros,
    handlers: {
        type: HagClass.type,
        createMacroHandlers: createHagMacroHandlers
    }
});