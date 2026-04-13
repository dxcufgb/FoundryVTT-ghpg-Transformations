import { Primordial as PrimordialClass } from "./Primordial.js"
import { PrimordialDefinition } from "./PrimordialDefinition.js"
import { primordialStages } from "./stages/primordialStages.js"
import { primordialTriggers } from "./triggers/primordialTriggers.js"

export const Primordial = Object.freeze({
    Class: PrimordialClass,
    Definition: PrimordialDefinition,
    Stages: primordialStages,
    Triggers: primordialTriggers,
    Effects: {},
    Macros: {},
    handlers: {}
})
