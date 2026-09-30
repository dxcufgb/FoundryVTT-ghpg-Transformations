import { Specter as SpecterClass } from "./Specter.js"
import { SpecterDefinition } from "./SpecterDefinition.js"
import { specterStages } from "./stages/specterStages.js"
import { specterTriggers } from "./triggers/specterTriggers.js"
import { registerMarkOfUnmakingHooks } from "./markOfUnmaking.js"

// Call of Unmaking: the Mark of Unmaking works on any creature (not only on
// transformed actors), so its damage hook is registered globally, once.
registerMarkOfUnmakingHooks()

export const Specter = Object.freeze({
    Class: SpecterClass,
    Definition: SpecterDefinition,
    Stages: specterStages,
    Triggers: specterTriggers,
    Effects: {},
    Macros: {},
    handlers: {}
})
