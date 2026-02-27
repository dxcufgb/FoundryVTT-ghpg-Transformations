import { Fey as FeyClass } from "./Fey.js"
import { FeyDefinition } from "./FeyDefinition.js"
import { feyStages } from "./stages/feyStages.js"
// import { feyEffects } from "./effects/index.js"
import { feyMacros } from "./macros.js"
import { createFeyMacroHandlers } from "./macros/handlers.js"
import { feyTriggers } from "./triggers/feyTriggers.js"

export const Fey = Object.freeze({
    Class: FeyClass,
    Definition: FeyDefinition,
    Stages: feyStages,
    Triggers: feyTriggers,
    Effects: {},//feyEffects,
    Macros: feyMacros,
    handlers: {
        type: FeyClass.type,
        createMacroHandlers: createFeyMacroHandlers
    }
})