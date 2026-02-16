// test/actions/chatAction.test.js

import { createChatAction } from "../../../services/actions/handlers/chat.js"
import { createFakeTracker } from "../../fakes/fakeTracker.js"
import { createTestActor } from "../../helpers/actors.js"

export function registerChatActionTests({ describe, it, expect })
{

    describe("Chat Action Handler", function()
    {

        let actor
        let handler
        let createdMessages
        let originalCreate
        let originalGetSpeaker

        beforeEach(async function()
        {

            actor = await createTestActor({ name: this.currentTest.title, options: { race: "humanoid" } })

            createdMessages = []

            // Mock ChatMessage
            originalCreate = ChatMessage.create
            originalGetSpeaker = ChatMessage.getSpeaker

            ChatMessage.create = async (data) =>
            {
                createdMessages.push(data)
            }

            ChatMessage.getSpeaker = ({ actor }) => ({
                actor: actor.id
            })

            handler = createChatAction({
                tracker: createFakeTracker(),
                logger: console
            })
        })

        afterEach(function()
        {
            ChatMessage.create = originalCreate
            ChatMessage.getSpeaker = originalGetSpeaker
        })

        // ─────────────────────────────────────────────
        // BASIC MESSAGE
        // ─────────────────────────────────────────────

        it("creates a chat message", async function()
        {

            await handler({
                actor,
                action: {
                    data: { message: "Hello world" }
                },
                context: {},
                variables: {}
            })

            expect(createdMessages.length).to.equal(1)
            expect(createdMessages[0].content).to.equal("Hello world")
            expect(createdMessages[0].speaker.actor).to.equal(actor.id)
        })

        // ─────────────────────────────────────────────
        // INTERPOLATION
        // ─────────────────────────────────────────────

        it("interpolates variables correctly", async function()
        {

            await handler({
                actor,
                action: {
                    data: { message: "Gained @amount temp HP" }
                },
                context: {},
                variables: { amount: 5 }
            })

            expect(createdMessages.length).to.equal(1)
            expect(createdMessages[0].content).to.equal("Gained 5 temp HP")
        })

        // ─────────────────────────────────────────────
        // ACTOR REFERENCE
        // ─────────────────────────────────────────────

        it("can interpolate actor properties", async function()
        {

            await handler({
                actor,
                action: {
                    data: { message: "@actor.name is mutated" }
                },
                context: {},
                variables: {}
            })

            expect(createdMessages.length).to.equal(1)
            expect(createdMessages[0].content).to.include(actor.name)
        })

        // ─────────────────────────────────────────────
        // TRANSFORMATION CONTEXT
        // ─────────────────────────────────────────────

        it("interpolates transformation context", async function()
        {

            await handler({
                actor,
                action: {
                    data: { message: "Stage @transformation.stage activated" }
                },
                context: {
                    transformation: { stage: 3 }
                },
                variables: {}
            })

            expect(createdMessages.length).to.equal(1)
            expect(createdMessages[0].content).to.equal("Stage 3 activated")
        })

        // ─────────────────────────────────────────────
        // NO TEMPLATE
        // ─────────────────────────────────────────────

        it("does nothing if message template missing", async function()
        {

            await handler({
                actor,
                action: { data: {} },
                context: {},
                variables: {}
            })

            expect(createdMessages.length).to.equal(0)
        })

        // ─────────────────────────────────────────────
        // TRACKER USED
        // ─────────────────────────────────────────────

        it("uses tracker to wrap execution", async function()
        {

            let tracked = false

            const fakeTracker = {
                track: async (fn) =>
                {
                    tracked = true
                    return await fn
                }
            }

            handler = createChatAction({
                tracker: fakeTracker,
                logger: console
            })

            await handler({
                actor,
                action: { data: { message: "Tracked" } },
                context: {},
                variables: {}
            })

            expect(tracked).to.equal(true)
        })

    })
}
