import { ShadowsteelGhoul as ShadowsteelGhoulClass } from "./ShadowsteelGhoul.js"
import { ShadowsteelGhoulDefinition } from "./ShadowsteelGhoulDefinition.js"
import { shadowsteelGhoulStages } from "./stages/shadowsteelGhoulStages.js"
import { shadowsteelGhoulTriggers } from "./triggers/shadowsteelGhoulTriggers.js"

export const ShadowsteelGhoul = Object.freeze({
    Class: ShadowsteelGhoulClass,
    Definition: ShadowsteelGhoulDefinition,
    Stages: shadowsteelGhoulStages,
    Triggers: shadowsteelGhoulTriggers,
    Effects: {},
    Macros: {},
    handlers: {}
})
