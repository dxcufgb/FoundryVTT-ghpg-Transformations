import { createRollModifierAction } from "../../../services/actions/handlers/rollModifier.js"
import { setupTest, tearDownEachTest } from "../../testLifecycle.js"

export function registerRollModifierActionTests({ describe, it, expect })
{
    describe("Roll Modifier Action Handler", function()
    {

        let actor
        let handler
        let fakeTracker

        beforeEach(async function()
        {
            ({ actor, fakeTracker } = await setupTest({
                currentTest: this.currentTest,
                createObjects: {
                    actor: { options: { race: "humanoid" } },
                    fakeTracker: {}
                }
            }))

            handler = createRollModifierAction({
                tracker: fakeTracker,
                logger: console
            })
        })

        afterEach(async function()
        {
            await tearDownEachTest()
        })

        it("removes modifier string from a single roll", async function()
        {
            const context = {
                rolls: [
                    {
                        parts: ["1d8 + @abilities.con.mod"]
                    }
                ]
            }

            const result = await handler({
                actor,
                action: {
                    mode: {
                        type: "remove",
                        string: "+ @abilities.con.mod"
                    }
                },
                context
            })

            expect(result).to.equal(true)
            expect(context.rolls[0].parts[0])
                .to.equal("1d8")
        })

        it("removes modifier from multiple rolls", async function()
        {
            const context = {
                rolls: [
                    { parts: ["1d8 + @abilities.con.mod"] },
                    { parts: ["1d10 + @abilities.con.mod"] }
                ]
            }

            await handler({
                actor,
                action: {
                    mode: {
                        type: "remove",
                        string: "+ @abilities.con.mod"
                    }
                },
                context
            })

            expect(context.rolls[0].parts[0]).to.equal("1d8")
            expect(context.rolls[1].parts[0]).to.equal("1d10")
        })

        it("does not modify non-string roll parts", async function()
        {
            const context = {
                rolls: [
                    {
                        parts: [
                            "1d8 + @abilities.con.mod",
                            5,
                            { foo: "bar" }
                        ]
                    }
                ]
            }

            await handler({
                actor,
                action: {
                    mode: {
                        type: "remove",
                        string: "+ @abilities.con.mod"
                    }
                },
                context
            })

            expect(context.rolls[0].parts[1]).to.equal(5)
            expect(context.rolls[0].parts[2])
                .to.deep.equal({ foo: "bar" })
        })

        it("returns false when context.rolls is missing", async function()
        {
            const result = await handler({
                actor,
                action: {
                    mode: {
                        type: "remove",
                        string: "+ @abilities.con.mod"
                    }
                },
                context: {}
            })

            expect(result).to.equal(false)
        })

        it("returns false when mode type does not match", async function()
        {
            const context = {
                rolls: [
                    { parts: ["1d8 + @abilities.con.mod"] }
                ]
            }

            const result = await handler({
                actor,
                action: {
                    mode: {
                        type: "somethingElse",
                        string: "+ @abilities.con.mod"
                    }
                },
                context
            })

            expect(result).to.equal(false)
            expect(context.rolls[0].parts[0])
                .to.equal("1d8 + @abilities.con.mod")
        })

        it("adds a damage type to the current attack activity parts", async function()
        {
            const context = {
                attacks: {
                    current: {
                        activity: {
                            damage: {
                                parts: [
                                    {
                                        types: new Set(["slashing"])
                                    }
                                ]
                            }
                        }
                    }
                }
            }

            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "addDamageType",
                        damageType: "force"
                    }
                },
                context
            })

            expect(result).to.equal(true)
            expect(
                Array.from(context.attacks.current.activity.damage.parts[0].types)
            ).to.include("force")
        })

        it("adds a damage type to the current pre-roll damage activity parts", async function()
        {
            const context = {
                damage: {
                    current: {
                        activity: {
                            damage: {
                                parts: [
                                    {
                                        types: new Set(["necrotic"])
                                    }
                                ]
                            }
                        }
                    }
                }
            }

            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "addDamageType",
                        damageType: "force"
                    }
                },
                context
            })

            expect(result).to.equal(true)
            expect(
                Array.from(context.damage.current.activity.damage.parts[0].types)
            ).to.include("force")
        })

        it("returns false when addDamageType has no current attack context", async function()
        {
            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "addDamageType",
                        damageType: "force"
                    }
                },
                context: {}
            })

            expect(result).to.equal(false)
        })

        it("appends a flat bonus part to each pre-roll damage roll", async function()
        {
            const context = {
                damage: {
                    current: {
                        rolls: [
                            { parts: ["1d8"] },
                            { parts: ["2d6 + 3"] }
                        ]
                    }
                }
            }

            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "addFlatBonus",
                        value: 4
                    }
                },
                context
            })

            expect(result).to.equal(false)
            expect(context.damage.current.rolls[0].parts).to.deep.equal([
                "1d8",
                "+ 4"
            ])
            expect(context.damage.current.rolls[1].parts).to.deep.equal([
                "2d6 + 3",
                "+ 4"
            ])
        })

        it("appends a flat bonus part after existing split damage parts", async function()
        {
            const context = {
                damage: {
                    current: {
                        rolls: [
                            {
                                parts: ["1d8", "@mod"]
                            }
                        ]
                    }
                }
            }

            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "addFlatBonus",
                        value: 4
                    }
                },
                context
            })

            expect(result).to.equal(false)
            expect(context.damage.current.rolls[0].parts).to.deep.equal([
                "1d8",
                "@mod",
                "+ 4"
            ])
        })

        it("does not apply the same keyed flat bonus to a roll twice", async function()
        {
            const context = {
                damage: {
                    current: {
                        rolls: [
                            { formula: "1d8", _formula: "1d8" }
                        ]
                    }
                }
            }
            const action = {
                data: {
                    mode: "addFlatBonus",
                    key: "shadowsteelGhoul.shadowsteelWeaponMasterDamage",
                    value: 4
                }
            }

            const firstResult = await handler({
                actor,
                action,
                context
            })
            const secondResult = await handler({
                actor,
                action,
                context
            })

            expect(firstResult).to.equal(true)
            expect(secondResult).to.equal(false)
            expect(context.damage.current.rolls[0].formula).to.equal("1d8 + 4")
            expect(context.damage.current.rolls[0]._formula).to.equal("1d8 + 4")
        })

        it("adds a flat bonus to roll formulas when parts are not present", async function()
        {
            const context = {
                damage: {
                    current: {
                        rolls: [
                            { formula: "1d10", _formula: "1d10" }
                        ]
                    }
                }
            }

            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "addFlatBonus",
                        value: 4
                    }
                },
                context
            })

            expect(result).to.equal(true)
            expect(context.damage.current.rolls[0].formula).to.equal("1d10 + 4")
            expect(context.damage.current.rolls[0]._formula).to.equal("1d10 + 4")
        })

        it("returns false when addFlatBonus has no pending roll collection", async function()
        {
            const result = await handler({
                actor,
                action: {
                    data: {
                        mode: "addFlatBonus",
                        value: 4
                    }
                },
                context: {}
            })

            expect(result).to.equal(false)
        })

        it("removes all occurrences of the string if present multiple times", async function()
        {
            const context = {
                rolls: [
                    {
                        parts: [
                            "1d8 + @abilities.con.mod + @abilities.con.mod"
                        ]
                    }
                ]
            }

            await handler({
                actor,
                action: {
                    mode: {
                        type: "remove",
                        string: "+ @abilities.con.mod"
                    }
                },
                context
            })

            expect(context.rolls[0].parts[0])
                .to.equal("1d8")
        })

    })
}
