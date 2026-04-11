// test/actions/saveAction.test.js

import { setupTest, tearDownEachTest } from "../../testLifecycle.js"

export function registerSaveActionTests({ describe, it, expect })
{

    describe("Save Action Handler", function()
    {

        let handler
        let tracker
        let logger
        let actor
        let context
        let variables

        beforeEach(async function()
        {
            let actionHandlers
            ({ actor, actionHandlers } = await setupTest({
                currentTest: this.currentTest,
                createObjects: {
                    actionHandlers: {}
                },
                initializeTestVariables: true
            }))

            tracker = {
                track: async (promise) => promise
            }

            logger = console

            handler = actionHandlers.SAVE

            actor = { id: "A1" }

            context = {}
            variables = {}
        })

        afterEach(async function()
        {
            await tearDownEachTest()
        })

        // ─────────────────────────────────────────────
        // Validation
        // ─────────────────────────────────────────────

        it("returns false if ability missing", async function()
        {

            const result = await handler({
                actor,
                action: { data: { dc: 12, key: "k" } },
                context,
                variables
            })

            expect(result).to.equal(false)
        })

        it("returns false if key missing", async function()
        {

            const result = await handler({
                actor,
                action: { data: { ability: "con", dc: 12 } },
                context,
                variables
            })

            expect(result).to.equal(false)
        })

        it("returns false if dc is invalid", async function()
        {

            const result = await handler({
                actor,
                action: { data: { ability: "con", dc: "abc", key: "k" } },
                context,
                variables
            })

            expect(result).to.equal(false)
        })

        // ─────────────────────────────────────────────
        // Successful save
        // ─────────────────────────────────────────────

        it("stores successful save result in context", async function()
        {

            globalThis.___TransformationTestEnvironment___.saveResult = 15

            const result = await handler({
                actor,
                action: {
                    data: {
                        ability: "con",
                        dc: 12,
                        key: "save-test"
                    }
                },
                context,
                variables
            })

            expect(result).to.equal(true)

            expect(context.saves).to.exist
            expect(context.saves["save-test"]).to.deep.equal({
                ability: "con",
                dc: 12,
                total: 15,
                success: true
            })
        })

        it("stores failed save result in context", async function()
        {

            globalThis.___TransformationTestEnvironment___.saveResult = 5

            await handler({
                actor,
                action: {
                    data: {
                        ability: "dex",
                        dc: 12,
                        key: "save-fail"
                    }
                },
                context,
                variables
            })

            expect(context.saves["save-fail"].success)
                .to.equal(false)
        })

        // ─────────────────────────────────────────────
        // executeSave returns null
        // ─────────────────────────────────────────────

        it("returns false if executeSave returns null", async function()
        {

            globalThis.___TransformationTestEnvironment___.saveResult = null

            const result = await handler({
                actor,
                action: {
                    data: {
                        ability: "wis",
                        dc: 12,
                        key: "save-null"
                    }
                },
                context,
                variables
            })

            expect(result).to.equal(false)
            expect(context.saves).to.be.undefined
        })

        // ─────────────────────────────────────────────
        // Formula resolution
        // ─────────────────────────────────────────────

        it("resolves formula dc using context + variables", async function()
        {

            globalThis.___TransformationTestEnvironment___.saveResult = 12

            context.prof = 3
            variables.stage = 2

            const result = await handler({
                actor,
                action: {
                    data: {
                        ability: "con",
                        dc: "@prof + @stage",
                        key: "formula-test"
                    }
                },
                context,
                variables
            })

            expect(result).to.equal(true)
            expect(context.saves["formula-test"].dc)
                .to.equal(5)
        })

        it("renders chat flavor with the chat-message-flavor template", async function()
        {
            globalThis.___TransformationTestEnvironment___.saveResult = 12

            await handler({
                actor,
                action: {
                    data: {
                        ability: "wis",
                        dc: 10,
                        key: "flavor-test",
                        flavor: {
                            img: "icons/test.webp",
                            title: "Wisdom Save",
                            subtitle: "Lycanthrope",
                            body: "Hold on to yourself."
                        }
                    }
                },
                context,
                variables
            })

            const flavorHtml =
                globalThis.___TransformationTestEnvironment___.saveOptions.message.data.flavor

            expect(flavorHtml).to.be.a("string")
            expect(flavorHtml).to.contain('class="chat-card item-card"')
            expect(flavorHtml).to.contain('src="icons/test.webp"')
            expect(flavorHtml).to.contain("Wisdom Save")
            expect(flavorHtml).to.contain("Lycanthrope")
            expect(flavorHtml).to.contain("Hold on to yourself.")
        })

    })
}
