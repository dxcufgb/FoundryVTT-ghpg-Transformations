// test/actions/effectAction.test.js

import { createEffectAction } from "../../../services/actions/handlers/effect.js"
import { setupTest, tearDownEachTest } from "../../testLifecycle.js"

export function registerEffectActionTests({ describe, it, expect })
{

    describe("Effect Action Handler", function()
    {

        let actor
        let handler
        let calls
        let fakeRepo
        let tracker

        beforeEach(async function()
        {
            let fakeTracker
            ({ actor, fakeTracker } = await setupTest({
                currentTest: this.currentTest,
                createObjects: {
                    actor: { options: { race: "humanoid" } },
                    fakeTracker: {},
                }
            }))
            tracker = fakeTracker
            calls = {
                create: [],
                createFromUuid: [],
                remove: []
            }

            fakeRepo = {
                hasByName: () => false,
                create: async (data) => calls.create.push(data),
                createFromUuid: async (data) =>
                {
                    calls.createFromUuid.push(data)
                    return { id: "effect-1" }
                },
                getIdsByName: () => [],
                removeByIds: async (actor, ids) =>
                {
                    calls.remove.push(ids)
                }
            }

            handler = createEffectAction({
                activeEffectRepository: fakeRepo,
                tracker,
                logger: console
            })
        })

        afterEach(async function()
        {
            await tearDownEachTest()
        })

        // ─────────────────────────────────────────────
        // APPLY MODE
        // ─────────────────────────────────────────────

        it("applies an effect", async function()
        {

            await handler({
                actor,
                action: {
                    data: {
                        mode: "apply",
                        name: "Test Effect"
                    }
                },
                context: {}
            })

            expect(calls.create.length).to.equal(1)
            expect(calls.create[0].name).to.equal("Test Effect")
            expect(calls.create[0].source).to.equal("transformation")
        })

        it("uses provided source when applying effect", async function()
        {

            await handler({
                actor,
                action: {
                    data: {
                        mode: "apply",
                        name: "Test Effect",
                        source: "custom-source"
                    }
                },
                context: {}
            })

            expect(calls.create[0].source).to.equal("custom-source")
        })

        it("does not duplicate effect if already present", async function()
        {

            fakeRepo.hasByName = () => true

            await handler({
                actor,
                action: {
                    data: {
                        mode: "apply",
                        name: "Duplicate Effect"
                    }
                },
                context: {}
            })

            expect(calls.create.length).to.equal(0)
        })

        it("instantiates an effect from uuid", async function()
        {

            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "instantiate",
                        uuid: "Compendium.transformations.gh-transformations.ActiveEffect.TestEffect",
                        source: "test-source"
                    }
                },
                context: {
                    test: true
                }
            })

            expect(result).to.equal(true)
            expect(calls.createFromUuid.length).to.equal(1)
            expect(calls.createFromUuid[0]).to.deep.equal({
                actor,
                uuid: "Compendium.transformations.gh-transformations.ActiveEffect.TestEffect",
                source: "test-source",
                context: {
                    test: true
                }
            })
        })

        it("returns false when instantiate mode is missing uuid", async function()
        {

            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "instantiate"
                    }
                },
                context: {}
            })

            expect(result).to.equal(false)
            expect(calls.createFromUuid.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // REMOVE MODE
        // ─────────────────────────────────────────────

        it("removes effect when present", async function()
        {

            fakeRepo.getIdsByName = () => ["id1", "id2"]

            await handler({
                actor,
                action: {
                    data: {
                        mode: "remove",
                        name: "Test Effect"
                    }
                },
                context: {}
            })

            expect(calls.remove.length).to.equal(1)
            expect(calls.remove[0]).to.deep.equal(["id1", "id2"])
        })

        it("does nothing if removing non-existent effect", async function()
        {

            fakeRepo.getIdsByName = () => []

            await handler({
                actor,
                action: {
                    data: {
                        mode: "remove",
                        name: "Missing Effect"
                    }
                },
                context: {}
            })

            expect(calls.remove.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // UNKNOWN MODE
        // ─────────────────────────────────────────────

        it("does nothing for unknown mode", async function()
        {

            await handler({
                actor,
                action: {
                    data: {
                        mode: "explode",
                        name: "Chaos"
                    }
                },
                context: {}
            })

            expect(calls.create.length).to.equal(0)
            expect(calls.remove.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // MISSING DATA
        // ─────────────────────────────────────────────

        it("does nothing when mode or name missing", async function()
        {

            await handler({
                actor,
                action: { data: {} },
                context: {}
            })

            expect(calls.create.length).to.equal(0)
            expect(calls.createFromUuid.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // TRACKER USED
        // ─────────────────────────────────────────────

        it("wraps execution in tracker", async function()
        {

            let tracked = false

            const trackingRepo = {
                ...fakeRepo
            }

            const trackingHandler = createEffectAction({
                activeEffectRepository: trackingRepo,
                tracker: {
                    track: async (fn) =>
                    {
                        tracked = true
                        return await fn
                    }
                },
                logger: console
            })

            await trackingHandler({
                actor,
                action: {
                    data: {
                        mode: "apply",
                        name: "Tracked Effect"
                    }
                },
                context: {}
            })

            expect(tracked).to.equal(true)
        })

    })
}
