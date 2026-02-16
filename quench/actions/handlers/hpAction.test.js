
import { createHpAction } from "../../../services/actions/handlers/hp.js"
import { createFakeTracker } from "../../fakes/fakeTracker.js"
import { createTestActor } from "../../helpers/actors.js"

export function registerHpActionTests({ describe, it, expect })
{
    describe("HP Action Handler", function()
    {

        let actor
        let handler
        let fakeRepo
        let calls

        beforeEach(async function()
        {

            actor = await createTestActor({ name: this.currentTest.title, options: { race: "humanoid" } })

            calls = []

            fakeRepo = {
                addTempHp: async (a, amount) =>
                {
                    calls.push({ fn: "temp", amount })
                    a.system.attributes.hp.temp = amount
                },
                addHp: async (a, amount) =>
                {
                    calls.push({ fn: "heal", amount })
                    a.system.attributes.hp.value += amount
                },
                applyDamage: async (a, amount) =>
                {
                    calls.push({ fn: "damage", amount })
                    a.system.attributes.hp.value -= amount
                },
                setActorHp: async (a, amount) =>
                {
                    calls.push({ fn: "set", amount })
                    a.system.attributes.hp.value = amount
                }
            }

            handler = createHpAction({
                actorRepository: fakeRepo,
                tracker: createFakeTracker(),
                logger: console
            })
        })

        it("applies temporary HP", async function()
        {

            await handler({
                actor,
                action: {
                    data: { mode: "temp", value: 5 }
                },
                variables: {}
            })

            expect(calls[0]).to.deep.equal({ fn: "temp", amount: 5 })
            expect(actor.system.attributes.hp.temp).to.equal(5)
        })

        it("heals HP", async function()
        {

            actor.system.attributes.hp.value = 10

            await handler({
                actor,
                action: {
                    data: { mode: "heal", value: 3 }
                },
                variables: {}
            })

            expect(calls[0]).to.deep.equal({ fn: "heal", amount: 3 })
            expect(actor.system.attributes.hp.value).to.equal(13)
        })

        it("applies damage", async function()
        {

            actor.system.attributes.hp.value = 10

            await handler({
                actor,
                action: {
                    data: { mode: "damage", value: 4 }
                },
                variables: {}
            })

            expect(calls[0]).to.deep.equal({ fn: "damage", amount: 4 })
            expect(actor.system.attributes.hp.value).to.equal(6)
        })

        it("sets HP directly", async function()
        {

            await handler({
                actor,
                action: {
                    data: { mode: "set", value: 2 }
                },
                variables: {}
            })

            expect(calls[0]).to.deep.equal({ fn: "set", amount: 2 })
            expect(actor.system.attributes.hp.value).to.equal(2)
        })

        it("resolves variable formulas", async function()
        {

            await handler({
                actor,
                action: {
                    data: { mode: "temp", value: "@x" }
                },
                variables: { x: 7 }
            })

            expect(calls[0]).to.deep.equal({ fn: "temp", amount: 7 })
        })

        it("does nothing for invalid mode", async function()
        {

            await handler({
                actor,
                action: {
                    data: { mode: "unknown", value: 5 }
                },
                variables: {}
            })

            expect(calls.length).to.equal(0)
        })

        it("does nothing when value is missing", async function()
        {

            await handler({
                actor,
                action: {
                    data: { mode: "temp" }
                },
                variables: {}
            })

            expect(calls.length).to.equal(0)
        })

        it("does nothing when resolved value is NaN", async function()
        {

            await handler({
                actor,
                action: {
                    data: { mode: "temp", value: "@missing" }
                },
                variables: {}
            })

            expect(calls.length).to.equal(1)
            expect(actor.system.attributes.hp.temp).to.equal(0)
        })

    })
}