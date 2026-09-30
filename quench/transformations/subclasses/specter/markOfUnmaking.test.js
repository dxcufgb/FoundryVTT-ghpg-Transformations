import {
    MARK_OF_UNMAKING_OPTION,
    findMarkOfUnmakingEffect,
    handleMarkOfUnmakingDamage
} from "../../../../domain/transformation/subclasses/specter/markOfUnmaking.js"

function createActor({ effects = [{ name: "Mark of Unmaking", disabled: false }] } = {})
{
    const calls = []
    return {
        name: "Marked Creature",
        effects,
        calls,
        async applyDamage(damages, options)
        {
            calls.push({ damages, options })
        }
    }
}

function createRollFactory(total, formulas = [])
{
    return formula =>
    {
        formulas.push(formula)
        return {
            total,
            async evaluate()
            {
                return this
            }
        }
    }
}

quench.registerBatch(
    "transformations.subClasses.specter.markOfUnmaking",
    ({describe, it, expect}) =>
    {
        describe("Specter Call of Unmaking: Mark of Unmaking", function()
        {
            it("applies an additional 1d6 Necrotic damage when a marked creature takes damage", async function()
            {
                const actor = createActor()
                const formulas = []

                const result = await handleMarkOfUnmakingDamage(actor, 7, {}, {
                    rollFactory: createRollFactory(4, formulas),
                    createMessage: false
                })

                expect(result?.value).to.equal(4)
                expect(formulas).to.have.length(1)
                expect(formulas[0]).to.match(/^1d6/)
                expect(actor.calls).to.have.length(1)
                expect(actor.calls[0].damages).to.deep.equal([{ value: 4, type: "necrotic" }])
                expect(actor.calls[0].options?.[MARK_OF_UNMAKING_OPTION]).to.equal(true)
            })

            it("does not trigger again for its own extra Necrotic damage", async function()
            {
                const actor = createActor()

                const result = await handleMarkOfUnmakingDamage(
                    actor,
                    4,
                    { [MARK_OF_UNMAKING_OPTION]: true },
                    { rollFactory: createRollFactory(3), createMessage: false }
                )

                expect(result).to.equal(null)
                expect(actor.calls).to.have.length(0)
            })

            it("does nothing when no damage was taken or the creature was healed", async function()
            {
                const actor = createActor()

                for (const amount of [0, -5, NaN]) {
                    await handleMarkOfUnmakingDamage(actor, amount, {}, {
                        rollFactory: createRollFactory(3),
                        createMessage: false
                    })
                }

                expect(actor.calls).to.have.length(0)
            })

            it("does nothing when the creature is not marked or the mark is disabled", async function()
            {
                const unmarked = createActor({ effects: [{ name: "Blessed", disabled: false }] })
                const disabled = createActor({ effects: [{ name: "Mark of Unmaking", disabled: true }] })

                await handleMarkOfUnmakingDamage(unmarked, 6, {}, {
                    rollFactory: createRollFactory(3),
                    createMessage: false
                })
                await handleMarkOfUnmakingDamage(disabled, 6, {}, {
                    rollFactory: createRollFactory(3),
                    createMessage: false
                })

                expect(findMarkOfUnmakingEffect(unmarked)).to.equal(null)
                expect(findMarkOfUnmakingEffect(disabled)).to.equal(null)
                expect(unmarked.calls).to.have.length(0)
                expect(disabled.calls).to.have.length(0)
            })
        })
    }
)
