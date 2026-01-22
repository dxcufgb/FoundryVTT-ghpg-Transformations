import { applyItemAction } from "./applyItemAction.js";
import { applyEffectAction } from "./applyEffectAction.js";
import { applyRollTableAction } from "./applyRollTableAction.js";
// import { applySaveAction } from "./applySaveAction.js";
import { applyHpAction } from "./applyHpAction.js";
import { applyChatAction } from "./applyChatAction.js";
import { applyMacroAction } from "./applyMacroAction.js";

/**
 * Registry of action executors.
 *
 * Keys MUST match action.type values exactly.
 */
export const actionExecutors = Object.freeze({
    item: applyItemAction,
    effect: applyEffectAction,
    rollTable: applyRollTableAction,
    // save: applySaveAction,
    hp: applyHpAction,
    chat: applyChatAction,
    macro: applyMacroAction
});
