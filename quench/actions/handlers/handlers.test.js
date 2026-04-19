// test/actions/handlers.batch.js

import { wait } from "../../helpers/wait.js"
import { teardownAllTest } from "../../testLifecycle.js"
import { registerChatActionTests } from "./chatAction.test.js"
import { registerActorFlagActionTests } from "./actorFlags.test.js"
import { registerActorHitDieActionTests } from "./actorHitDie.test.js"
import { registerDialogActionTests } from "./dialogAction.test.js"
import { registerEffectActionTests } from "./effectAction.test.js"
import { registerHpActionTests } from "./hpAction.test.js"
import { registerItemActionTests } from "./itemAction.test.js"
import { registerItemActivityActionTests } from "./itemActivityAction.test.js"
import { registerMacroActionTests } from "./macroAction.test.js"
import { registerRollModifierActionTests } from "./rollModifier.test.js"
import { registerRollTableActionTests } from "./rollTable.test.js"
import { registerSaveActionTests } from "./saveAction.test.js"

quench.registerBatch(
    "transformations.actions.handlers",
    ({ describe, it, expect }) =>
    {
        after(async function()
        {
            await wait(200)
            await teardownAllTest()
        })
        registerChatActionTests({ describe, it, expect })
        registerActorFlagActionTests({ describe, it, expect })
        registerActorHitDieActionTests({ describe, it, expect })
        registerEffectActionTests({ describe, it, expect })
        registerHpActionTests({ describe, it, expect })
        registerItemActionTests({ describe, it, expect })
        registerItemActivityActionTests({ describe, it, expect })
        registerMacroActionTests({ describe, it, expect })
        registerRollTableActionTests({ describe, it, expect })
        registerSaveActionTests({ describe, it, expect })
        registerRollModifierActionTests({ describe, it, expect })
        registerDialogActionTests({ describe, it, expect })
    }
)
