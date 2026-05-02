import { advanceStageAndChoose } from "../helpers/adcanceStageAndExpectchoiceDialog.js"
import { expectAsyncWork } from "../helpers/async/expectAsyncWork.js"
import { createTestRuntime } from "../helpers/testRuntime.js"
import { wait } from "../helpers/wait.js"
import { waitForCondition } from "../helpers/waitForCondition.js"
import { setupTest, tearDownEachTest, teardownAllTest } from "../testLifecycle.js"

quench.registerBatch(
    "transformations.vampire.stage1ActorFlags",
    ({ describe, it, expect }) =>
    {
        let actor
        let runtime = createTestRuntime()
        let transformationDef
        const existingActorIds = game.actors.map(currentActor => currentActor.id)

        async function localSetupTest(currentTest)
        {
            ({ actor } = await setupTest({
                currentTest,
                createObjects: {
                    actor: {
                        name: `${currentTest.title}(vampire)`,
                        options: { race: "humanoid" }
                    }
                }
            }))
            transformationDef =
                await runtime.services.transformationQueryService.getDefinitionById(
                    "vampire"
                )
        }

        async function tearDownTest()
        {
            await tearDownEachTest()
        }

        after(async function()
        {
            await wait(200)
            const existingIdSet = new Set(existingActorIds)

            const testActorIds = game.actors
                .filter(currentActor => !existingIdSet.has(currentActor.id))
                .map(currentActor => currentActor.id)

            await teardownAllTest({
                actorsToDeleteIds: testActorIds
            })
        })

        describe("Vampire Stage 1 Actor Flags", function()
        {
            this.timeout(10_000)

            beforeEach(async function()
            {
                await localSetupTest(this.currentTest)
            })

            afterEach(async function()
            {
                await tearDownTest()
            })

            it("applies maximumDaysPerFeed to the transformation-scoped vampire flags", async function()
            {
                await expectAsyncWork(
                    () => runtime.services.transformationService.applyTransformation(
                        actor,
                        { definition: transformationDef }
                    ),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )

                expect(
                    actor.getFlag("transformations", "vampire")?.maximumDaysPerFeed
                ).to.equal(undefined)

                const stage1 = Object.values(transformationDef.stages)
                    .find(stage => stage.stage === 1)

                expect(stage1).to.exist
                expect(stage1.grants?.actor?.flags?.maximumDaysPerFeed).to.equal(7)

                const stage1Choice =
                    stage1.choices?.items?.find(choice => !choice.requires?.items?.length) ??
                    stage1.choices?.items?.[0]

                expect(stage1Choice?.uuid).to.be.a("string")

                await advanceStageAndChoose({
                    actor,
                    stage: 1,
                    choiceUuid: stage1Choice.uuid,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                await runtime.dependencies.utils.asyncTrackers.whenIdle()

                await waitForCondition(() =>
                    actor.getFlag("transformations", "vampire")?.maximumDaysPerFeed ===
                    stage1.grants.actor.flags.maximumDaysPerFeed
                )

                expect(
                    actor.getFlag("transformations", "vampire")?.maximumDaysPerFeed
                ).to.equal(stage1.grants.actor.flags.maximumDaysPerFeed)
            })
        })
    }
)
