import { Fiend as FiendClass } from "./Fiend.js"
import { FiendDefinition } from "./FiendDefinition.js"
import { fiendStages } from "./stages/fiendStages.js"
import { fiendMacros } from "./macros.js"
import { createFiendMacroHandlers } from "./macros/handlers.js"
import { fiendTriggers } from "./triggers/fiendTriggers.js"

export const Fiend = Object.freeze({
    Class: FiendClass,
    Definition: FiendDefinition,
    Stages: fiendStages,
    Triggers: fiendTriggers,
    Effects: {},
    Macros: fiendMacros,
    handlers: {
        type: FiendClass.type,
        createMacroHandlers: createFiendMacroHandlers
    }
})
