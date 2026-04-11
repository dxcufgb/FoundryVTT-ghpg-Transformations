import { Lycanthrope as LycanthropeClass } from "./Lycanthrope.js"
import { LycanthropeDefinition } from "./LycanthropeDefinition.js"
import { createLycanthropeMacroHandlers } from "./macros/handlers.js"
import { lycanthropeMacros } from "./macros.js"
import { lycanthropeStages } from "./stages/lycanthropeStages.js"
import { lycanthropeTriggers } from "./triggers/lycanthropeTriggers.js"

export const Lycanthrope = Object.freeze({
    Class: LycanthropeClass,
    Definition: LycanthropeDefinition,
    Stages: lycanthropeStages,
    Triggers: lycanthropeTriggers,
    Effects: {},
    Macros: lycanthropeMacros,
    handlers: {
        type: LycanthropeClass.type,
        createMacroHandlers: createLycanthropeMacroHandlers
    }
})
