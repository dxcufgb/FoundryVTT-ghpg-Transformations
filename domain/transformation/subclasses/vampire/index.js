import { Vampire as VampireClass } from "./Vampire.js"
import { VampireDefinition } from "./VampireDefinition.js"
import { vampireStages } from "./stages/vampireStages.js"
import { vampireTriggers } from "./triggers/vampireTriggers.js"

export const Vampire = Object.freeze({
    Class: VampireClass,
    Definition: VampireDefinition,
    Stages: vampireStages,
    Triggers: vampireTriggers,
    Effects: {},
    Macros: {},
    handlers: {}
})
