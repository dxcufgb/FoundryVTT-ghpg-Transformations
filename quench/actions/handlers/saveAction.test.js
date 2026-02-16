// test/actions/saveAction.test.js

import { createSaveAction } from "../../../services/actions/handlers/save.js"
import { createFakeTracker } from "../../fakes/fakeTracker.js"
import { createTestActor } from "../../helpers/actors.js"

export function registerSaveActionTests({ describe, it, expect })
{

    describe("Save Action Handler", function()
    {

        let actor
        let handler
        let tracker
        let context
        let rollCalls

        beforeEach(async function()
        {

            actor = await createTestActor({ name: this.currentTest.title, options: { race: "humanoid" } })

            rollCalls = []

            actor.rollAbilitySave = async (ability, options) =>
            {
                rollCalls.push({ ability, options })
                return { total: 15 }
            }

            tracker = createFakeTracker()

            handler = createSaveAction({
                tracker,
                logger: console
            })

            context = {}
        })

        // ─────────────────────────────────────────────
        // VALIDATION
        // ─────────────────────────────────────────────

        it("skips if ability missing", async function()
        {

            await handler({
                actor,
                action: { data: { dc: 10, key: "test" } },
                context
            })

            expect(rollCalls.length).to.equal(0)
        })

        it("skips if key missing", async function()
        {

            await handler({
                actor,
                action: { data: { ability: "con", dc: 10 } },
                context
            })

            expect(rollCalls.length).to.equal(0)
        })

        it("skips if DC resolves to invalid number", async function()
        {

            await handler({
                actor,
                action: { data: { ability: "con", dc: "invalid", key: "x" } },
                context
            })

            expect(rollCalls.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // EXECUTION
        // ─────────────────────────────────────────────

        it("calls rollAbilitySave with correct arguments", async function()
        {

            await handler({
                actor,
                action: {
                    data: {
                        ability: "con",
                        dc: 12,
                        key: "save-test"
                    }
                },
                context
            })

            expect(rollCalls.length).to.equal(1)

            expect(rollCalls[0].ability).to.equal("con")

            expect(rollCalls[0].options).to.deep.equal({
                dc: 12,
                chatMessage: true,
                fastForward: false
            })
        })

        // ─────────────────────────────────────────────
        // SUCCESS / FAILURE
        // ─────────────────────────────────────────────

        it("stores success result in context", async function()
        {

            actor.rollAbilitySave = async () => ({ total: 20 })

            await handler({
                actor,
                action: {
                    data: {
                        ability: "dex",
                        dc: 10,
                        key: "dex-save"
                    }
                },
                context
            })

            expect(context.saves['dex-save']).to.deep.equal({
                ability: "dex",
                dc: 10,
                total: 20,
                success: true
            })
        })

        it("stores failure result in context", async function()
        {

            actor.rollAbilitySave = async () => ({ total: 5 })

            await handler({
                actor,
                action: {
                    data: {
                        ability: "wis",
                        dc: 12,
                        key: "wis-save"
                    }
                },
                context
            })

            expect(context.saves["wis-save"].success).to.equal(false)
        })

        // ─────────────────────────────────────────────
        // NULL ROLL
        // ─────────────────────────────────────────────

        it("does nothing if roll returns null", async function()
        {

            actor.rollAbilitySave = async () => null

            await handler({
                actor,
                action: {
                    data: {
                        ability: "con",
                        dc: 10,
                        key: "null-test"
                    }
                },
                context
            })

            expect(context.saves).to.be.undefined
        })

        // ─────────────────────────────────────────────
        // TRACKER
        // ─────────────────────────────────────────────

        it("runs inside tracker", async function()
        {

            let tracked = false

            const trackingHandler = createSaveAction({
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
                        ability: "con",
                        dc: 10,
                        key: "tracker-test"
                    }
                },
                context
            })

            expect(tracked).to.equal(true)
        })

        // ─────────────────────────────────────────────
        // ERROR PROPAGATION
        // ─────────────────────────────────────────────

        it("propagates error if roll throws", async function()
        {

            actor.rollAbilitySave = async () =>
            {
                throw new Error("roll failed")
            }

            let errorCaught = false

            try {
                await handler({
                    actor,
                    action: {
                        data: {
                            ability: "con",
                            dc: 10,
                            key: "error-test"
                        }
                    },
                    context
                })
            } catch {
                errorCaught = true
            }

            expect(errorCaught).to.equal(true)
        })

    })
}
