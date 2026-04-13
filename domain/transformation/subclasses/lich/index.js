import { Lich as LichClass } from "./Lich.js"
import { LichDefinition } from "./LichDefinition.js"
import { lichStages } from "./stages/lichStages.js"
import { lichTriggers } from "./triggers/lichTriggers.js"

export const Lich = Object.freeze({
    Class: LichClass,
    Definition: LichDefinition,
    Stages: lichStages,
    Triggers: lichTriggers,
    Effects: {},
    Macros: {},
    handlers: {}
})
