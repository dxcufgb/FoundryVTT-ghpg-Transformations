// import { createApplyEffectHandler } from "./applyEffect.js";
// import { createMacroHandler } from "./macro.js";
import { createHpAction } from "../handlers/hp.js";
import { createRollTableAction } from "../handlers/rollTable.js";
// import { createClearTransformationEffectsHandler } from "./clearTransformationEffects.js";

export function createActionsRuntime({
    rollTableEffectResolver,
    rollTableService,
    constants,
    effectChangeBuilder,
    chatService,
    actorRepository,
    macroExecutor,
    logger
}) {
    const handlers = {
        // APPLY_EFFECT: createApplyEffectHandler({ effectService }),
        // MACRO: createMacroHandler({ macroExecutor }),
        APPLY_ROLLTABLE: createRollTableAction({
            rollTableService,
            rollTableEffectResolver,
            constants,
            actorRepository,
            effectChangeBuilder,
            chatService,
            logger
        }),
        HP: createHpAction({
            rollTableService,
            rollTableEffectResolver,
            logger
        })
        // CLEAR_TRANSFORMATION_EFFECTS: createClearTransformationEffectsHandler({ effectService })
    };

    return Object.freeze(handlers);
}
