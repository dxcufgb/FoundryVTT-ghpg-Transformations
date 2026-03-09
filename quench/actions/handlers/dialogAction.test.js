// test/actions/dialogAction.test.js

import { createDialogAction }
    from "../../../services/actions/handlers/dialog.js"

import
{
    setupTest,
    tearDownEachTest
} from "../../testLifecycle.js"

export function registerDialogActionTests({
    describe,
    it,
    expect
})
{
    describe("Dialog Action Handler", function()
    {
        this.timeout(10_000)
        let actor
        let handler
        let tracker
        let calls
        let fakeDialogFactory

        beforeEach(async function()
        {
            let fakeTracker

            ({ actor, fakeTracker } = await setupTest({
                currentTest: this.currentTest,
                createObjects: {
                    actor: {},
                    fakeTracker: {}
                }
            }))

            tracker = fakeTracker

            calls = {
                invoked: []
            }

            fakeDialogFactory = {
                openTransformationGeneralChoiceDialog: async (data) =>
                {
                    calls.invoked.push(data)
                    return "fire"
                }
            }

            handler = createDialogAction({
                getGame: () =>
                {
                    const fakeGame = {}
                    fakeGame.transformations = {
                        getDialogFactory: () => fakeDialogFactory
                    }
                    return fakeGame
                },
                tracker,
                logger: console
            })
        })

        afterEach(async function()
        {
            await tearDownEachTest()
        })

        // ─────────────────────────────────────────────
        // VALID EXECUTION
        // ─────────────────────────────────────────────

        it("calls dialogFactory function with actor and data", async function()
        {
            const result = await handler({
                actor,
                action: {
                    type: "DIALOG",
                    data: {
                        dialogFactoryFunction: "openTransformationGeneralChoiceDialog",
                        choices: [
                            { icon: "modules/transformations/icons/DamageTypes/Fire.png", id: "fire", label: "Fire" }
                        ],
                        description: "Choose one."
                    }
                },
                context: {}
            })

            expect(calls.invoked.length).to.equal(1)
            expect(calls.invoked[0].actor).to.equal(actor)
            expect(calls.invoked[0].choices.length).to.equal(1)
            expect(result).to.equal(true)
        })

        // ─────────────────────────────────────────────
        // INVALID TYPE
        // ─────────────────────────────────────────────

        it("does nothing when type is not DIALOG", async function()
        {
            const result = await handler({
                actor,
                action: {
                    type: "NOT_A_DIALOG"
                },
                context: {}
            })

            expect(result).to.equal(undefined)
            expect(calls.invoked.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // MISSING FUNCTION NAME
        // ─────────────────────────────────────────────

        it("does nothing when dialogFactoryFunction missing", async function()
        {
            await handler({
                actor,
                action: {
                    type: "DIALOG"
                },
                context: {}
            })

            expect(calls.invoked.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // UNKNOWN FACTORY FUNCTION
        // ─────────────────────────────────────────────

        it("does nothing when factory function does not exist", async function()
        {
            await handler({
                actor,
                action: {
                    type: "DIALOG",
                    dialogFactoryFunction: "doesNotExist"
                },
                context: {}
            })

            expect(calls.invoked.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // MISSING ACTOR
        // ─────────────────────────────────────────────

        it("does nothing when actor missing", async function()
        {
            await handler({
                actor: null,
                action: {
                    type: "DIALOG",
                    dialogFactoryFunction: "openTransformationGeneralChoiceDialog"

                },
                context: {}
            })

            expect(calls.invoked.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // TRACKER USED
        // ─────────────────────────────────────────────

        it("wraps execution in tracker", async function()
        {
            let tracked = false

            const trackingHandler = createDialogAction({
                getGame: () =>
                {
                    const fakeGame = {}
                    fakeGame.transformations = {
                        getDialogFactory: () => fakeDialogFactory
                    }
                    return fakeGame
                },
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
                    type: "DIALOG",
                    data: {
                        dialogFactoryFunction: "openTransformationGeneralChoiceDialog"
                    }
                },
                context: {}
            })

            expect(tracked).to.equal(true)
        })
    })
}
