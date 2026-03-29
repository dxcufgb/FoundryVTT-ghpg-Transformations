// subclasses/hag/index.js
import { Hag } from "../Hag.js";
import { createHagMacroHandlers } from "./handlers.js";

export const HagSubclass = Object.freeze({
    type: Hag.type,
    createMacroHandlers: createHagMacroHandlers
});
