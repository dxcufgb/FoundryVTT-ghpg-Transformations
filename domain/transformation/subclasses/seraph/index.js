import { Seraph as SeraphClass } from "./Seraph.js"
import { SeraphDefinition } from "./SeraphDefinition.js"
import { seraphStages } from "./stages/seraphStages.js"
import { seraphTriggers } from "./triggers/seraphTriggers.js"
import { SeraphAuras } from "./Feats/SeraphAuras.js"

// Aura of Holy Purge / Aura of Righteous Mercy act on the Seraph's allies,
// who are not Seraphs themselves, so they listen to the actor hooks directly
// instead of going through the per-transformation dispatch.
SeraphAuras.register()

export const Seraph = Object.freeze({
    Class: SeraphClass,
    Definition: SeraphDefinition,
    Stages: seraphStages,
    Triggers: seraphTriggers,
    Effects: {},
    Macros: {},
    handlers: {}
})
