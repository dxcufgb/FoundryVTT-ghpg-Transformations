import { ElementalImbalance } from "../../../../domain/transformation/subclasses/primordial/Feats/ElementalImbalance.js"
import "./heartOfStone.test.js"

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

            it("uses the triggering type's own applied amount when other damage types were applied too", function()
            {
                const trigger = ElementalImbalance.resolveTriggerDamage({
                    actor: createActor(),
                    damage: 15,
                    details: {},
                    damageType: "fire",
                    rawDamage: 10,
                    appliedDamage: 5
                })

                expect(trigger).to.deep.include({
                    type: "fire",
                    amount: 10,
                    vulnerabilityDamage: 5
                })
            })

            it("triggers on the raw amount when only the triggering type was negated by Immunity", function()
            {
                const trigger = ElementalImbalance.resolveTriggerDamage({
                    actor: createActor(),
                    damage: 8,
                    details: {},
                    damageType: "fire",
                    rawDamage: 6,
                    appliedDamage: 0
                })

                expect(trigger).to.deep.include({
                    type: "fire",
                    amount: 6,
                    vulnerabilityDamage: 12
                })
            })
        })

        describe("ElementalImbalance.resolveAppliedDamageForType", function()
        {
            it("sums the post-mitigation values of the given type only", function()
            {
                const amount = ElementalImbalance.resolveAppliedDamageForType([
                    {type: "slashing", value: 9},
                    {type: "fire", value: 3.5},
                    {type: "fire", value: 2}
                ], "fire")

                expect(amount).to.equal(5)
            })

            it("returns null when the type is absent or not elemental", function()
            {
                const damages = [{type: "slashing", value: 9}]

                expect(ElementalImbalance.resolveAppliedDamageForType(damages, "fire")).to.equal(null)
                expect(ElementalImbalance.resolveAppliedDamageForType(damages, "slashing")).to.equal(null)
            })
        })
    }
)
