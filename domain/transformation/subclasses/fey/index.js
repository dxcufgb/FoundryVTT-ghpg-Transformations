import { Fey as FeyClass } from "./Fey.js"
import { FeyDefinition } from "./FeyDefinition.js"
import { feyStages } from "./stages/feyStages.js"
import { feyTriggers } from "./triggers/feyTriggers.js"

export const Fey = Object.freeze({
    Class: FeyClass,
    Definition: FeyDefinition,
    Stages: feyStages,
    Triggers: feyTriggers,
    Effects: {},//feyEffects,
    Macros: {},
    handlers: {}
})