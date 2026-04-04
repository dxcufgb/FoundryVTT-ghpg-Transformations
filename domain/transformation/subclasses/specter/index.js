import { Specter as SpecterClass } from "./Specter.js"
import { SpecterDefinition } from "./SpecterDefinition.js"
import { specterStages } from "./stages/specterStages.js"
import { specterTriggers } from "./triggers/specterTriggers.js"

export const Specter = Object.freeze({
    Class: SpecterClass,
    Definition: SpecterDefinition,
    Stages: specterStages,
    Triggers: specterTriggers,
    Effects: {},
    Macros: {},
    handlers: {}
})
