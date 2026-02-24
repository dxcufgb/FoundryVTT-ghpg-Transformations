// test/actions/macroAction.test.js

import { createMacroAction } from "../../../services/actions/handlers/macroAction.js"
import { setupTest, tearDownEachTest } from "../../testLifecycle.js"

export function registerMacroActionTests({ describe, it, expect })
{

    describe("Macro Action Handler", function()
    {

        let actor
        let handler
        let invokeCalls
        let fakeInvoker
        let tracker

        beforeEach(async function()
        {
            let fakeTracker
            ({ actor, fakeTracker } = await setupTest({
                currentTest: this.currentTest,
                createObjects: {
                    actor: { options: { race: "humanoid" } },
                    fakeTracker: {}
                }
            }))
            tracker = fakeTracker

            invokeCalls = []

            fakeInvoker = {
                invoke: async (payload) =>
                {
                    invokeCalls.push(payload)
                }
            }

            handler = createMacroAction({
                directMacroInvoker: fakeInvoker,
                tracker,
                logger: console
            })
        })

        afterEach(async function()
        {
            await tearDownEachTest()
        })

        // ─────────────────────────────────────────────
        // BASIC EXECUTION
        // ─────────────────────────────────────────────

        it("invokes macro with correct base payload", async function()
        {

            await handler({
                actor,
                action: {
                    data: {
                        transformationType: "aberrant-horror",
                        action: "bloodied"
                    }
                },
                context: {},
                variables: {}
            })

            expect(invokeCalls.length).to.equal(1)

            const call = invokeCalls[0]

            expect(call.actor).to.equal(actor)
            expect(call.transformationType).to.equal("aberrant-horror")
            expect(call.action).to.equal("bloodied")
            expect(call.context.actorUuid).to.equal(actor.uuid)
        })

        // ─────────────────────────────────────────────
        // CONTEXT MERGING
        // ─────────────────────────────────────────────

        it("merges args, variables, and context correctly", async function()
        {

            await handler({
                actor,
                action: {
                    data: {
                        transformationType: "test-type",
                        action: "test-action",
                        args: {
                            foo: 1
                        }
                    }
                },
                context: {
                    trigger: "bloodied",
                    bar: 2
                },
                variables: {
                    baz: 3
                }
            })

            const ctx = invokeCalls[0].context

            expect(ctx.actorUuid).to.equal(actor.uuid)
            expect(ctx.foo).to.equal(1)
            expect(ctx.bar).to.equal(2)
            expect(ctx.baz).to.equal(3)
            expect(ctx.trigger).to.equal("bloodied")
        })

        // ─────────────────────────────────────────────
        // INVALID PAYLOAD
        // ─────────────────────────────────────────────

        it("does not invoke macro if type missing", async function()
        {

            await handler({
                actor,
                action: {
                    data: {
                        action: "missing-type"
                    }
                },
                context: {},
                variables: {}
            })

            expect(invokeCalls.length).to.equal(0)
        })

        it("does not invoke macro if action missing", async function()
        {

            await handler({
                actor,
                action: {
                    data: {
                        transformationType: "test-type"
                    }
                },
                context: {},
                variables: {}
            })

            expect(invokeCalls.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // TRACKER USAGE
        // ─────────────────────────────────────────────

        it("wraps invocation in tracker", async function()
        {

            let tracked = false

            const trackingHandler = createMacroAction({
                directMacroInvoker: fakeInvoker,
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
                        transformationType: "t",
                        action: "a"
                    }
                },
                context: {},
                variables: {}
            })

            expect(tracked).to.equal(true)
        })

        // ─────────────────────────────────────────────
        // ERROR PROPAGATION
        // ─────────────────────────────────────────────

        it("returns false if macro invocation throws", async function()
        {

            const throwingInvoker = {
                invoke: async () =>
                {
                    throw new Error("macro failed")
                }
            }

            const throwingHandler = createMacroAction({
                directMacroInvoker: throwingInvoker,
                tracker,
                logger: console
            })

            const result = await throwingHandler({
                actor,
                action: {
                    data: {
                        transformationType: "x",
                        action: "y"
                    }
                },
                context: {},
                variables: {}
            })

            expect(result).to.equal(false)
        })

    })
}
