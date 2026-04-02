import { Hag as HagClass } from "./Hag.js";
import { HagDefinition } from "./HagDefinition.js";
import { hagStages } from "./stages/hagStages.js";
import { hagTriggers } from "./triggers/hagTriggers.js";

export const Hag = Object.freeze({
    Class: HagClass,
    Definition: HagDefinition,
    Stages: hagStages,
    Triggers: hagTriggers,
    Effects: {},
    Macros: {},
    handlers: {}
});