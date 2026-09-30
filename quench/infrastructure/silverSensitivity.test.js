import { applySilverSensitivity } from "../../infrastructure/hooks/silverSensitivity.js"

function sensitiveActor(enabled = true)
{
    return { flags: { transformations: { silverSensitivity: enabled } } }
}

function damage(type, value, properties = [], active = {})
{
    return { type, value, properties: new Set(properties), active: { multiplier: 1, ...active } }
}

function summary(...parts)
{
    const damages = [...parts]
    damages.amount = parts.reduce((total, part) => total + part.value, 0)
    damages.temp = 0
    return damages
}

quench.registerBatch(
    "transformations.SilverSensitivity",
    ({ describe, it, expect }) =>
    {
        describe("applySilverSensitivity", () =>
        {
            it("doubles silvered slashing damage", () =>
            {
                const damages = summary(damage("slashing", 7, ["sil"]))
                expect(applySilverSensitivity(sensitiveActor(), damages)).to.equal(true)
                expect(damages[0].value).to.equal(14)
                expect(damages[0].active.vulnerability).to.equal(true)
                expect(damages.amount).to.equal(14)
            })

            it("leaves ordinary (non-silvered) weapon damage alone", () =>
            {
                const damages = summary(damage("piercing", 5), damage("bludgeoning", 4, ["mgc"]))
                expect(applySilverSensitivity(sensitiveActor(), damages)).to.equal(false)
                expect(damages.amount).to.equal(9)
            })

            it("removes resistance and applies vulnerability to silvered damage", () =>
            {
                // Resisted to 3 by dnd5e: silver ignores the resistance and doubles the base 6.
                const damages = summary(damage("piercing", 3, ["sil", "mgc"], { resistance: true, multiplier: 0.5 }))
                applySilverSensitivity(sensitiveActor(), damages)
                expect(damages[0].value).to.equal(12)
                expect(damages[0].active.resistance).to.equal(false)
                expect(damages[0].active.vulnerability).to.equal(true)
                expect(damages.amount).to.equal(12)
            })

            it("does not double non-physical damage from a silvered weapon", () =>
            {
                const damages = summary(damage("fire", 6, ["sil"]))
                expect(applySilverSensitivity(sensitiveActor(), damages)).to.equal(false)
                expect(damages[0].value).to.equal(6)
            })

            it("does nothing without the Silver Sensitivity flag", () =>
            {
                const damages = summary(damage("slashing", 7, ["sil"]))
                expect(applySilverSensitivity(sensitiveActor(false), damages)).to.equal(false)
                expect(damages[0].value).to.equal(7)
            })
        })
    }
)
