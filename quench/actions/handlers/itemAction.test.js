// test/actions/itemAction.test.js

import { createItemAction } from "../../../services/actions/handlers/item.js"
import { setupTest, tearDownEachTest } from "../../testLifecycle.js"


export function registerItemActionTests({ describe, it, expect })
{

    describe("Item Action Handler", function()
    {

        let actor
        let handler
        let fakeRepo
        let calls

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
            calls = []

            fakeRepo = {
                addItemFromUuid: async (a, uuid, options) =>
                {
                    calls.push({ fn: "add", uuid, options })
                },

                findEmbeddedByUuidFlag: (a, uuid) =>
                {
                    return fakeRepo.__item
                },

                getRemainingUses: (item) =>
                {
                    return item?.remaining ?? 0
                },

                consumeUses: async (item, uses) =>
                {
                    calls.push({ fn: "consume", uses })
                },

                removeBySourceUuid: async (a, uuid) =>
                {
                    calls.push({ fn: "remove", uuid })
                },

                __item: null
            }

            handler = createItemAction({
                itemRepository: fakeRepo,
                tracker: fakeTracker,
                logger: console
            })
        })

        afterEach(async function()
        {
            await tearDownEachTest()
        })

        // ─────────────────────────────────────────────
        // ADD
        // ─────────────────────────────────────────────

        it("adds an item", async function()
        {

            const result = await handler({
                actor,
                action: {
                    data: { mode: "add", uuid: "test-uuid" }
                },
                context: { foo: "bar" }
            })

            expect(result).to.equal(true)
            expect(calls[0].fn).to.equal("add")
            expect(calls[0].uuid).to.equal("test-uuid")
            expect(calls[0].options.context.foo).to.equal("bar")
        })

        // ─────────────────────────────────────────────
        // CONSUME SUCCESS
        // ─────────────────────────────────────────────

        it("consumes item uses when enough remain", async function()
        {

            fakeRepo.__item = { name: "Test Item", remaining: 3 }

            const result = await handler({
                actor,
                action: {
                    data: { mode: "consume", uuid: "test-uuid", uses: 2 }
                }
            })

            expect(result).to.equal(true)
            expect(calls[0]).to.deep.equal({ fn: "consume", uses: 2 })
        })

        // ─────────────────────────────────────────────
        // CONSUME - MISSING ITEM
        // ─────────────────────────────────────────────

        it("returns false when item not found for consume", async function()
        {

            fakeRepo.__item = null

            const result = await handler({
                actor,
                action: {
                    data: { mode: "consume", uuid: "missing" }
                }
            })

            expect(result).to.equal(false)
            expect(calls.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // CONSUME - NOT ENOUGH USES
        // ─────────────────────────────────────────────

        it("returns false when not enough uses remain", async function()
        {

            fakeRepo.__item = { name: "Test Item", remaining: 1 }

            const result = await handler({
                actor,
                action: {
                    data: { mode: "consume", uuid: "test-uuid", uses: 2 }
                }
            })

            expect(result).to.equal(false)
            expect(calls.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // REMOVE
        // ─────────────────────────────────────────────

        it("removes item by source uuid", async function()
        {

            const result = await handler({
                actor,
                action: {
                    data: { mode: "remove", uuid: "remove-uuid" }
                }
            })

            expect(result).to.equal(true)
            expect(calls[0]).to.deep.equal({
                fn: "remove",
                uuid: "remove-uuid"
            })
        })

        // ─────────────────────────────────────────────
        // UNKNOWN MODE
        // ─────────────────────────────────────────────

        it("returns false for unknown mode", async function()
        {

            const result = await handler({
                actor,
                action: {
                    data: { mode: "mystery", uuid: "x" }
                }
            })

            expect(result).to.equal(false)
            expect(calls.length).to.equal(0)
        })

    })
}
