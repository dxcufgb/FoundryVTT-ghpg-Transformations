// test/actions/rollTableAction.test.js

import { createRollTableAction } from "../../../services/actions/handlers/rollTable.js"
import { setupTest, tearDownEachTest } from "../../testLifecycle.js"

export function registerRollTableActionTests({ describe, it, expect })
{

    describe("RollTable Action Handler", function()
    {

        let handler
        let tracker
        let actor
        let rollTableService
        let rollTableEffectResolver
        let logger

        beforeEach(async function()
        {
            ({ actor } = await setupTest({
                currentTest: this.currentTest,
                createObjects: {
                    actor: {
                        options: { race: "humanoid" }
                    }
                }
            }))

            tracker = {
                track: async (promise) => promise
            }

            logger = console

            actor = {
                flags: {},
                getFlag: async (scope, key) =>
                    actor.flags[key],
                setFlag: async (scope, key, value) =>
                {
                    actor.flags[key] = value
                }
            }

            rollTableService = {
                roll: async () => null
            }

            rollTableEffectResolver = {
                resolve: () => null
            }

            handler = createRollTableAction({
                rollTableService,
                rollTableEffectResolver,
                tracker,
                logger: console
            })
        })

        afterEach(async function()
        {
            await tearDownEachTest()
        })

        // ─────────────────────────────────────────────
        // Calls rollTableService with correct payload
        // ─────────────────────────────────────────────

        it("calls rollTableService.roll with merged context", async function()
        {

            let receivedPayload

            actor.flags.currentRollTableEffectLowRange = 10

            rollTableService.roll = async (payload) =>
            {
                receivedPayload = payload
                return null
            }

            await handler({
                actor,
                action: {
                    data: {
                        uuid: "table-uuid",
                        mode: "test-mode"
                    }
                },
                context: { stage: 3 }
            })

            expect(receivedPayload.uuid).to.equal("table-uuid")
            expect(receivedPayload.mode).to.equal("test-mode")
            expect(receivedPayload.context.stage).to.equal(3)
            expect(receivedPayload.context.currentRollTableEffectLowRange)
                .to.equal(10)
        })

        // ─────────────────────────────────────────────
        // Early return when no outcome
        // ─────────────────────────────────────────────

        it("returns early when outcome is null", async function()
        {

            rollTableService.roll = async () => null

            await handler({
                actor,
                action: { data: { uuid: "x", mode: "m" } },
                context: {}
            })

            expect(actor.flags.currentRollTableEffectLowRange)
                .to.be.undefined
        })

        it("returns early when effectKey missing", async function()
        {

            rollTableService.roll = async () => ({
                result: { range: [5] }
            })

            await handler({
                actor,
                action: { data: { uuid: "x", mode: "m" } },
                context: {}
            })

            expect(actor.flags.currentRollTableEffectLowRange)
                .to.be.undefined
        })

        // ─────────────────────────────────────────────
        // Sets flag and applies effect
        // ─────────────────────────────────────────────

        it("sets flag and applies resolved effect", async function()
        {

            let applied = false

            rollTableService.roll = async () => ({
                effectKey: "EFFECT_X",
                result: { range: [20] }
            })

            rollTableEffectResolver.resolve = ({ actor, effectKey }) =>
            {
                expect(effectKey).to.equal("EFFECT_X")
                return {
                    apply: async () => { applied = true }
                }
            }

            await handler({
                actor,
                action: { data: { uuid: "x", mode: "m" } },
                context: {}
            })

            expect(actor.flags.currentRollTableEffectLowRange)
                .to.equal(20)

            expect(applied).to.equal(true)
        })

        // ─────────────────────────────────────────────
        // No resolved effect
        // ─────────────────────────────────────────────

        it("does not crash if resolver returns null", async function()
        {

            rollTableService.roll = async () => ({
                effectKey: "EFFECT_X",
                result: { range: [30] }
            })

            rollTableEffectResolver.resolve = () => null

            await handler({
                actor,
                action: { data: { uuid: "x", mode: "m" } },
                context: {}
            })

            expect(actor.flags.currentRollTableEffectLowRange)
                .to.equal(30)
        })

    })
}
