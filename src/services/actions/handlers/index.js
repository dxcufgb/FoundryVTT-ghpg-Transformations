import { createHpAction } from "./hp.js"
import { createItemAction } from "./item.js"
import { createRollTableAction } from "./rollTable.js"
import { createChatAction } from "./chat.js"
import { createSaveAction } from "./save.js"
import { createEffectAction } from "./effect.js"
import { createMacroAction } from "./macroAction.js"

export function createActionHandlers({
    trackers,
    directMacroInvoker,
    actorRepository,
    itemRepository,
    activeEffectRepository,
    rollTableService,
    rollTableEffectResolver,
    logger
})
{
    return Object.freeze({
        APPLY_ROLLTABLE: createRollTableAction({
            tracker: trackers.mutations,
            rollTableService,
            rollTableEffectResolver,
            logger
        }),
        CHAT: createChatAction({
            tracker: trackers.ui,
            logger
        }),
        EFFECT: createEffectAction({
            tracker: trackers.mutations,
            activeEffectRepository,
            logger
        }),
        HP: createHpAction({
            tracker: trackers.mutations,
            actorRepository,
            logger
        }),
        ITEM: createItemAction({
            tracker: trackers.mutations,
            itemRepository,
            logger
        }),
        MACRO: createMacroAction({
            tracker: trackers.macros,
            directMacroInvoker,
            logger
        }),
        SAVE: createSaveAction({
            tracker: trackers.ui,
            logger
        }),
    })
}
