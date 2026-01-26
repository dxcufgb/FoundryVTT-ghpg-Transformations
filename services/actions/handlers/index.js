import { createHpAction } from "./hp.js";
import { createItemAction } from "./item.js";
import { createRollTableAction } from "./rollTable.js";
import { createChatAction } from "./chat.js";
import { createSaveAction } from "./save.js";
import { createEffectAction } from "./effect.js";
import { createMacroAction } from "./macroAction.js";

export function createActionHandlers({
    directMacroInvoker,
    actorRepository,
    itemRepository,
    activeEffectRepository,
    rollTableService,
    rollTableEffectResolver,
    logger
}) {
    return Object.freeze({
        APPLY_ROLLTABLE: createRollTableAction({
            rollTableService,
            rollTableEffectResolver,
            logger
        }),
        CHAT: createChatAction({ logger }),
        EFFECT: createEffectAction({
            activeEffectRepository,
            logger
        }),
        HP: createHpAction({
            actorRepository,
            logger
        }),
        ITEM: createItemAction({
            itemRepository,
            logger
        }),
        MACRO: createMacroAction({
            directMacroInvoker,
            logger
        }),
        SAVE: createSaveAction({ logger }),



    });
}
