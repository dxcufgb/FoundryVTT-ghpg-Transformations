import { Seraph as SeraphClass } from "./Seraph.js"
import { SeraphDefinition } from "./SeraphDefinition.js"
import { seraphStages } from "./stages/seraphStages.js"
import { seraphTriggers } from "./triggers/seraphTriggers.js"

export const Seraph = Object.freeze({
    Class: SeraphClass,
    Definition: SeraphDefinition,
    Stages: seraphStages,
    Triggers: seraphTriggers,
    Effects: {},
    Macros: {},
    handlers: {}
})
