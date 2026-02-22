import { createTestActor } from "../../helpers/actors.js"
import { cleanupQuenchTestActors } from "../../helpers/cleanupActors.js"
import { createTestRuntime } from "../../helpers/testRuntime.js"
import { wait } from "../../helpers/wait.js"
import { teardownAllTest } from "../../testLifecycle.js"
import { runTransformationTestSuite } from "./runTransformationTestSuite.js"
import { TransformationSubclassTestRegistry } from "./subclassesTests.js"

quench.registerBatch(
    "transformations.subClasses",
    ({ describe, it, assert, expect }) =>
    {
        const existingActorIds = game.actors.map(actor => actor.id)

        after(async function()
        {
            await wait(200)
            const existingIdSet = new Set(existingActorIds)

            const testActorIds = game.actors
                .filter(actor => !existingIdSet.has(actor.id))
                .map(actor => actor.id)

            await teardownAllTest(testActorIds)
        })
        for (const entry of TransformationSubclassTestRegistry) {

            runTransformationTestSuite({
                mochaFunctions: { describe, it, assert, expect },
                testDef: entry.testDefinition
            })
        }
    }
)
