// test/actions/handlers.batch.js

import { wait } from "../../helpers/wait.js"
import { teardownAllTest } from "../../testLifecycle.js"
import { registerChatActionTests } from "./chatAction.test.js"
import { registerEffectActionTests } from "./effectAction.test.js"
import { registerHpActionTests } from "./hpAction.test.js"
import { registerItemActionTests } from "./itemAction.test.js"
import { registerMacroActionTests } from "./macroAction.test.js"
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
        registerEffectActionTests({ describe, it, expect })
        registerHpActionTests({ describe, it, expect })
        registerItemActionTests({ describe, it, expect })
        registerMacroActionTests({ describe, it, expect })
        registerRollTableActionTests({ describe, it, expect })
        registerSaveActionTests({ describe, it, expect })
    }
)
