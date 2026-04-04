import { Ooze as OozeClass } from "./Ooze.js"
import { OozeDefinition } from "./OozeDefinition.js"
import { oozeStages } from "./stages/oozeStages.js"
import { oozeTriggers } from "./triggers/oozeTriggers.js"

export const Ooze = Object.freeze({
    Class: OozeClass,
    Definition: OozeDefinition,
    Stages: oozeStages,
    Triggers: oozeTriggers,
    Effects: {},
    Macros: {},
    handlers: {}
})
