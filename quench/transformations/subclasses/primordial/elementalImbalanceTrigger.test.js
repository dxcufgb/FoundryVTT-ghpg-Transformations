import { ElementalImbalance } from "../../../../domain/transformation/subclasses/primordial/Feats/ElementalImbalance.js"

function createActor(damageTypePerMidiId = {})
{
    return {
        getFlag(scope, key)
        {
            if (scope === "transformations" && key === "damageTypePerMidiId") {
                return damageTypePerMidiId
            }
            return null
        }
    }
}

quench.registerBatch(
    "transformations.subClasses.primordial.elementalImbalanceTrigger",
    ({describe, it, expect}) =>
    {
        describe("ElementalImbalance.resolveTriggerDamage", function()
        {
            it("uses the applied amount as extra damage and the raw amount as splash when resisted", function()
            {
                const trigger = ElementalImbalance.resolveTriggerDamage({
                    actor: createActor(),
                    damage: 6,
                    details: {},
                    damageType: "fire",
                    rawDamage: 12
                })

                expect(trigger).to.deep.include({
                    type: "fire",
                    amount: 12,
                    vulnerabilityDamage: 6
                })
            })

            it("caps the extra damage at the instance's raw amount when other damage types were applied too", function()
            {
                const trigger = ElementalImbalance.resolveTriggerDamage({
                    actor: createActor(),
                    damage: 15,
                    details: {},
                    damageType: "fire",
                    rawDamage: 10
                })

                expect(trigger).to.deep.include({
                    type: "fire",
                    amount: 10,
                    vulnerabilityDamage: 10
                })
            })

            it("uses the applied amount when no raw amount is known", function()
            {
                const trigger = ElementalImbalance.resolveTriggerDamage({
                    actor: createActor(),
                    damage: 7,
                    details: {},
                    damageType: "acid"
                })

                expect(trigger).to.deep.include({
                    type: "acid",
                    amount: 7,
                    vulnerabilityDamage: 7
                })
            })

            it("triggers on the raw amount when Immunity reduced the damage to 0", function()
            {
                const trigger = ElementalImbalance.resolveTriggerDamage({
                    actor: createActor(),
                    damage: 0,
                    details: {},
                    damageType: "cold",
                    rawDamage: 10
                })

                expect(trigger).to.deep.include({
                    type: "cold",
                    amount: 10,
                    vulnerabilityDamage: 20
                })
            })

            it("does not trigger for a non-elemental instance even if the flag map has an elemental type", function()
            {
                const trigger = ElementalImbalance.resolveTriggerDamage({
                    actor: createActor({"midi-1": "fire"}),
                    damage: 8,
                    details: {midi: {sourceActorUuid: "midi-1"}},
                    damageType: "slashing",
                    rawDamage: 8
                })

                expect(trigger).to.equal(null)
            })

            it("does not trigger when nothing was applied and no raw amount is known", function()
            {
                const trigger = ElementalImbalance.resolveTriggerDamage({
                    actor: createActor(),
                    damage: 0,
                    details: {},
                    damageType: "fire"
                })

                expect(trigger).to.equal(null)
            })
        })
    }
)
