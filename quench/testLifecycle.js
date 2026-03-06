import { registerTransformationMacros } from "../bootstrap/registerTransformtaionsMacros.js"
import { createActionExecutor } from "../infrastructure/actions/createActionExecutor.js"
import { createFakeTracker } from "./fakes/fakeTracker.js"
import { createTestActor } from "./helpers/actors.js"
import { cleanupQuenchTestActors } from "./helpers/cleanupActors.js"
import { createTestActionHandlers } from "./helpers/createTestActionHandlers.js"
import { readyGame } from "./helpers/setup.js"
import { createTestRuntime } from "./helpers/testRuntime.js"

export async function setupTest({
    currentTest,
    createObjects = {},
    initializeTestVariables = false
} = {})
{
    let returnObjects = {}
    await readyGame()

    globalThis.__TRANSFORMATIONS_TEST__ = true
    if (initializeTestVariables) {
        globalThis.___TransformationTestEnvironment___ = {}
    }

    if (createObjects.runtime) {
        returnObjects.runtime = createTestRuntime({
            serviceMocks: createObjects.runtime.serviceMocks != undefined ? createObjects.runtime.serviceMocks : {},
            infrastructureMocks: createObjects.runtime.infrastructureMocks != undefined ? createObjects.runtime.infrastructureMocks : {},
            loggerLevel: createObjects.runtime.loggerLevel != undefined ? createObjects.runtime.loggerLevel : {}
        })
        registerTransformationMacros({
            macroRegistry: returnObjects.runtime.infrastructure.macroRegistry,
            activeEffectRepository: returnObjects.runtime.infrastructure.activeEffectRepository,
            itemRepository: returnObjects.runtime.infrastructure.itemRepository,
            logger: logger
        })
    }

    if (createObjects.actor) {
        returnObjects.actor = await createTestActor({
            ...createObjects.actor,
            name: currentTest.title
        })
    }

    if (createObjects.fakeTracker) {
        returnObjects.fakeTracker = createFakeTracker()
    }

    if (createObjects.actionExecutor) {
        returnObjects.actionExecutor = createActionExecutor({
            tracker: returnObjects.fakeTracker !== undefined ? returnObjects.fakeTracker : createFakeTracker(),
            actorRepository: returnObjects.runtime.infrastructure.actorRepository,
            onceService: returnObjects.runtime.infrastructure.onceService,
            logger
        })
    }

    if (createObjects.actionHandlers) {
        returnObjects.actionHandlers = createTestActionHandlers(returnObjects.runtime != undefined ? returnObjects.runtime : createTestRuntime())
    }

    return returnObjects
}

export async function tearDownEachTest({
    resetChat = true,
    resetActors = false,
    tearDownExtras = {}
} = {})
{

    try {

        // 1️⃣ Clear global override flags
        delete globalThis.___TransformationTestEnvironment___

        // 2️⃣ Clear Chat log
        if (resetChat && game?.messages) {
            const ids = game.messages.contents.map(m => m.id)
            if (ids.length)
                await ChatMessage.deleteDocuments(ids)
        }

        // 3️⃣ Optional actor cleanup
        if (resetActors) {
            for (const actor of game.actors) {
                await actor.unsetFlag("transformations", "currentRollTableEffectLowRange")
            }
        }

        if (tearDownExtras.dialog) {
            await tearDownExtras.dialog.remove()
            tearDownExtras.dialog = null
        }

        if (tearDownExtras.sheet) {
            await tearDownExtras.sheet.close()
            tearDownExtras.sheet = null
        }

    } catch (err) {
        console.error("tearDownTest failed:", err)
    }
}

export async function teardownAllTest({
    actorsToDeleteIds = []
} = {})
{
    delete globalThis.__TRANSFORMATIONS_TEST__
    delete globalThis.___TransformationTestEnvironment___
    await cleanupQuenchTestActors(actorsToDeleteIds)
}