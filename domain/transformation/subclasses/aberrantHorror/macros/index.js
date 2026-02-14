// subclasses/aberrantHorror/index.js
import { AberrantHorror } from "./AberrantHorror.js";
import { createAberrantHorrorMacroHandlers } from "./handlers.js";

export const AberrantHorrorSubclass = Object.freeze({
    type: AberrantHorror.type,
    createMacroHandlers: createAberrantHorrorMacroHandlers
});
