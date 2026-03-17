import { RollService } from "../../services/rolls/RollService.js"

quench.registerBatch(
    "transformations.chatMessages.RollService",
    ({ describe, it, expect }) =>
    {
        let originalRoll
        let originalDice3d

        beforeEach(function()
        {
            originalRoll = globalThis.Roll
            originalDice3d = game.dice3d
        })

        afterEach(function()
        {
            globalThis.Roll = originalRoll
            game.dice3d = originalDice3d
        })

        describe("RollService", function()
        {
            it("rolls the supplied formula and shows it through Dice So Nice when available", async function()
            {
                const calls = []
                const rolledResult = { total: 9 }

                globalThis.Roll = class
                {
                    constructor(formula)
                    {
                        this.formula = formula
                        calls.push({
                            fn: "construct",
                            formula
                        })
                    }

                    async roll()
                    {
                        calls.push({
                            fn: "roll",
                            formula: this.formula
                        })
                        return rolledResult
                    }
                }

                game.dice3d = {
                    showForRoll: async (roll, user, broadcast) =>
                    {
                        calls.push({
                            fn: "showForRoll",
                            roll,
                            user,
                            broadcast
                        })
                    }
                }

                const result = await RollService.simpleRoll("2d6")

                expect(result).to.equal(rolledResult)
                expect(calls[0]).to.deep.equal({
                    fn: "construct",
                    formula: "2d6"
                })
                expect(calls[1]).to.deep.equal({
                    fn: "roll",
                    formula: "2d6"
                })
                expect(calls[2].fn).to.equal("showForRoll")
                expect(calls[2].roll).to.equal(rolledResult)
                expect(calls[2].user).to.equal(game.user)
                expect(calls[2].broadcast).to.equal(true)
            })

            it("returns the roll without showing 3d dice when dice3d is unavailable", async function()
            {
                let showForRollWasCalled = false
                const rolledResult = { total: 4 }

                globalThis.Roll = class
                {
                    async roll()
                    {
                        return rolledResult
                    }
                }

                game.dice3d = {
                    showForRoll: async () =>
                    {
                        showForRollWasCalled = true
                    }
                }

                game.dice3d = null

                const result = await RollService.simpleRoll("1d20")

                expect(result).to.equal(rolledResult)
                expect(showForRollWasCalled).to.equal(false)
            })
        })
    }
)
