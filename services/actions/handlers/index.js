import { createHpAction } from "./hp.js"
import { createItemAction } from "./item.js"
import { createRollTableAction } from "./rollTable.js"
import { createChatAction } from "./chat.js"
import { createSaveAction } from "./save.js"
import { createEffectAction } from "./effect.js"
import { createMacroAction } from "./macroAction.js"
import { createDialogAction } from "./dialog.js"

export function createActionHandlers({
    trackers,
    getGame,
    directMacroInvoker,
    actorRepository,
    itemRepository,
    activeEffectRepository,
    rollTableService,
    rollTableEffectResolver,
    logger
})
{
    logger.debug("createActionHandlers", {
        trackers,
        getGame,
        directMacroInvoker,
        actorRepository,
        itemRepository,
        activeEffectRepository,
        rollTableService,
        rollTableEffectResolver
    })

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
        DIALOG: createDialogAction({
            getGame,
            tracker: trackers.ui,
            logger
        }),
        SAVE: createSaveAction({
            tracker: trackers.ui,
            logger
        }),
    })
}
