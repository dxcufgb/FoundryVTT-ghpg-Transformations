import { HeartOfStone } from "../../../../domain/transformation/subclasses/primordial/Feats/HeartOfStone.js"

function createEffect({
    id,
    name = "Heart of Stone",
    changes = [{key: "system.traits.ci.value", mode: 2, value: "prone", priority: 20}],
    flags = {}
} = {})
{
    return {id, name, changes, flags}
}

function createActor({temp = 0, effects = []} = {})
{
    const deleted = []
    return {
        deleted,
        system: {attributes: {hp: {temp}}},
        effects: {contents: effects},
        async deleteEmbeddedDocuments(type, ids)
        {
            deleted.push({type, ids})
        }
    }
}

quench.registerBatch(
    "transformations.subClasses.primordial.heartOfStone",
    ({describe, it, expect}) =>
    {
        describe("HeartOfStone.removeIfTempHpDepleted", function()
        {
            it("removes the Prone immunity when temporary hit points drop to 0", async function()
            {
                const actor = createActor({
                    temp: 0,
                    effects: [
                        createEffect({id: "hos"}),
                        createEffect({id: "other", name: "Bless", changes: []})
                    ]
                })

                const removed = await HeartOfStone.removeIfTempHpDepleted({
                    actor,
                    changed: {system: {attributes: {hp: {temp: 0}}}}
                })

                expect(removed).to.equal(true)
                expect(actor.deleted).to.deep.equal([{type: "ActiveEffect", ids: ["hos"]}])
            })

            it("keeps the effect while temporary hit points remain", async function()
            {
                const actor = createActor({temp: 3, effects: [createEffect({id: "hos"})]})

                const removed = await HeartOfStone.removeIfTempHpDepleted({
                    actor,
                    changed: {"system.attributes.hp.temp": 3}
                })

                expect(removed).to.equal(false)
                expect(actor.deleted).to.have.length(0)
            })

            it("ignores updates that do not touch temporary hit points", async function()
            {
                const actor = createActor({temp: 0, effects: [createEffect({id: "hos"})]})

                const removed = await HeartOfStone.removeIfTempHpDepleted({
                    actor,
                    changed: {system: {attributes: {hp: {value: 5}}}}
                })

                expect(removed).to.equal(false)
            })

            it("recognises the effect by its transformations flag", function()
            {
                expect(HeartOfStone.isHeartOfStoneEffect(createEffect({
                    name: "Renamed",
                    changes: [],
                    flags: {transformations: {heartOfStone: true}}
                }))).to.equal(true)
            })
        })
    }
)
