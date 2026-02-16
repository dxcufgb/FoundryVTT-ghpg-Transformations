// test/actions/rollTableAction.test.js

import { createRollTableAction } from "../../../services/actions/handlers/rollTable.js"
import { createFakeTracker } from "../../fakes/fakeTracker.js"
import { createTestActor } from "../../helpers/actors.js"

export function registerRollTableActionTests({ describe, it, expect })
{

    describe("RollTable Action Handler", function()
    {

        let actor
        let handler
        let fakeRollService
        let fakeResolver
        let tracker
        let rollCalls
        let applyCalls

        beforeEach(async function()
        {

            actor = await createTestActor({ name: this.currentTest.title, options: { race: "humanoid" } })

            rollCalls = []
            applyCalls = []

            fakeRollService = {
                roll: async (payload) =>
                {
                    rollCalls.push(payload)
                    return { effectKey: "test-effect" }
                }
            }

            fakeResolver = {
                resolve: ({ actor, effectKey }) =>
                {
                    return {
                        apply: async () =>
                        {
                            applyCalls.push(effectKey)
                        }
                    }
                }
            }

            tracker = createFakeTracker()

            handler = createRollTableAction({
                rollTableService: fakeRollService,
                rollTableEffectResolver: fakeResolver,
                tracker,
                logger: console
            })
        })

        // ─────────────────────────────────────────────
        // BASIC EXECUTION
        // ─────────────────────────────────────────────

        it("calls rollTableService with correct arguments", async function()
        {

            await handler({
                actor,
                action: {
                    data: {
                        uuid: "Compendium.test.Table",
                        mode: "normal"
                    }
                },
                context: { foo: "bar" }
            })

            expect(rollCalls.length).to.equal(1)

            expect(rollCalls[0]).to.deep.equal({
                uuid: "Compendium.test.Table",
                mode: "normal",
                context: { foo: "bar" }
            })
        })

        it("resolves effect and applies it", async function()
        {

            await handler({
                actor,
                action: {
                    data: {
                        uuid: "Compendium.test.Table",
                        mode: "normal"
                    }
                },
                context: {}
            })

            expect(applyCalls.length).to.equal(1)
            expect(applyCalls[0]).to.equal("test-effect")
        })

        // ─────────────────────────────────────────────
        // NO OUTCOME
        // ─────────────────────────────────────────────

        it("does nothing if roll returns null", async function()
        {

            fakeRollService.roll = async () => null

            await handler({
                actor,
                action: { data: { uuid: "x" } },
                context: {}
            })

            expect(applyCalls.length).to.equal(0)
        })

        it("does nothing if roll returns no effectKey", async function()
        {

            fakeRollService.roll = async () => ({})

            await handler({
                actor,
                action: { data: { uuid: "x" } },
                context: {}
            })

            expect(applyCalls.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // NO RESOLVED EFFECT
        // ─────────────────────────────────────────────

        it("does nothing if resolver returns null", async function()
        {

            fakeResolver.resolve = () => null

            await handler({
                actor,
                action: {
                    data: { uuid: "x" }
                },
                context: {}
            })

            expect(applyCalls.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // TRACKER USAGE
        // ─────────────────────────────────────────────

        it("runs inside tracker", async function()
        {

            let tracked = false

            const trackingHandler = createRollTableAction({
                rollTableService: fakeRollService,
                rollTableEffectResolver: fakeResolver,
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
                    data: { uuid: "x" }
                },
                context: {}
            })

            expect(tracked).to.equal(true)
        })

        // ─────────────────────────────────────────────
        // ERROR PROPAGATION
        // ─────────────────────────────────────────────

        it("propagates error if roll throws", async function()
        {

            fakeRollService.roll = async () =>
            {
                throw new Error("roll failed")
            }

            let errorCaught = false

            try {
                await handler({
                    actor,
                    action: { data: { uuid: "x" } },
                    context: {}
                })
            } catch {
                errorCaught = true
            }

            expect(errorCaught).to.equal(true)
        })

    })
}
