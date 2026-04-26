import { createAbilityScoreAdvancementController } from "../../ui/controllers/abilityScoreAdvancementController.js"
import { AbilityScoreAdvancementDialog } from "../../ui/dialogs/AbilityScoreAdvancementDialog.js"
import { createAbilityScoreAdvancementViewModel } from "../../ui/viewModels/createAbilityScoreAdvancementViewModel.js"

function nextTick()
{
    return new Promise(resolve => setTimeout(resolve, 0))
}

function createActor(abilityValues = {})
{
    return {
        system: {
            abilities: {
                str: {value: abilityValues.str ?? 10},
                dex: {value: abilityValues.dex ?? 10},
                con: {value: abilityValues.con ?? 10},
                int: {value: abilityValues.int ?? 10},
                wis: {value: abilityValues.wis ?? 10},
                cha: {value: abilityValues.cha ?? 10}
            }
        }
    }
}

quench.registerBatch(
    "transformations.Dialogs.abilityScoreAdvancementDialog",
    ({describe, it, expect}) =>
    {
        describe("createAbilityScoreAdvancementViewModel", function ()
        {
            it("maps all six abilities with current values and locked states", function ()
            {
                const viewModel = createAbilityScoreAdvancementViewModel({
                    actor: createActor({
                        str: 15,
                        dex: 14,
                        con: 13,
                        int: 12,
                        wis: 11,
                        cha: 8
                    }),
                    advancementConfiguration: {
                        cap: 1,
                        fixed: {},
                        locked: ["str", "dex", "con"],
                        max: 20,
                        points: 1
                    }
                })

                expect(viewModel.abilities.map(ability => ability.key)).to.deep.equal([
                    "str",
                    "dex",
                    "con",
                    "int",
                    "wis",
                    "cha"
                ])
                expect(viewModel.pointsRemaining).to.equal(1)
                expect(viewModel.abilities[0]).to.include({
                    key: "str",
                    label: "Strength",
                    currentValue: 15,
                    locked: true,
                    selectedValue: 15
                })
                expect(viewModel.abilities[3]).to.include({
                    key: "int",
                    label: "Intelligence",
                    currentValue: 12,
                    locked: false,
                    selectedValue: 12
                })
            })
        })

        describe("AbilityScoreAdvancementController", function ()
        {
            it("resolves the selected ability values on confirm", async function ()
            {
                let resolvedValue = null
                const controller = createAbilityScoreAdvancementController({
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                await controller.confirm({
                    int: 11
                })

                expect(resolvedValue).to.deep.equal({
                    int: 11
                })
            })

            it("resolves null on cancel", function ()
            {
                let resolvedValue = "value"
                const controller = createAbilityScoreAdvancementController({
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                controller.cancel()

                expect(resolvedValue).to.equal(null)
            })
        })

        describe("AbilityScoreAdvancementDialog", function ()
        {
            it("renders all six ability rows and disables locked controls", async function ()
            {
                const dialog = new AbilityScoreAdvancementDialog({
                    actor: createActor(),
                    viewModel: createAbilityScoreAdvancementViewModel({
                        actor: createActor(),
                        advancementConfiguration: {
                            cap: 1,
                            fixed: {},
                            locked: ["str", "dex", "con"],
                            max: 20,
                            points: 1
                        }
                    }),
                    controller: {
                        confirm: async () => {},
                        cancel: () => {}
                    },
                    logger: null
                })

                await dialog.render(true)

                const rows = dialog.element.querySelectorAll(
                    "[data-ability-row]"
                )
                const lockedIncrease = dialog.element.querySelector(
                    "[data-action='increase'][data-ability-key='str']"
                )
                const lockedDecrease = dialog.element.querySelector(
                    "[data-action='decrease'][data-ability-key='str']"
                )

                expect(rows.length).to.equal(6)
                expect(lockedIncrease.disabled).to.equal(true)
                expect(lockedDecrease.disabled).to.equal(true)

                await dialog.close({force: true})
            })

            it("enforces points, cap, max, and current-value minimums", async function ()
            {
                const viewModel = createAbilityScoreAdvancementViewModel({
                    actor: createActor({
                        int: 10,
                        wis: 19
                    }),
                    advancementConfiguration: {
                        cap: 1,
                        fixed: {},
                        locked: ["str", "dex", "con"],
                        max: 20,
                        points: 1
                    }
                })
                const dialog = new AbilityScoreAdvancementDialog({
                    actor: createActor({
                        int: 10,
                        wis: 19
                    }),
                    viewModel,
                    controller: {
                        confirm: async () => {},
                        cancel: () => {}
                    },
                    logger: null
                })

                await dialog.render(true)

                const intIncrease = dialog.element.querySelector(
                    "[data-action='increase'][data-ability-key='int']"
                )
                const intDecrease = dialog.element.querySelector(
                    "[data-action='decrease'][data-ability-key='int']"
                )
                const wisIncrease = dialog.element.querySelector(
                    "[data-action='increase'][data-ability-key='wis']"
                )
                const intRow = dialog.element.querySelector(
                    "[data-ability-row='int']"
                )
                const remainingPoints = dialog.element.querySelector(
                    "[data-points-remaining]"
                )

                intIncrease.click()
                await nextTick()

                expect(intRow.querySelector("[data-selected-value]").textContent.trim())
                .to.equal("11")
                expect(remainingPoints.textContent.trim()).to.equal("0")
                expect(intIncrease.disabled).to.equal(true)
                expect(wisIncrease.disabled).to.equal(true)
                expect(intDecrease.disabled).to.equal(false)

                intDecrease.click()
                await nextTick()

                expect(intRow.querySelector("[data-selected-value]").textContent.trim())
                .to.equal("10")
                expect(remainingPoints.textContent.trim()).to.equal("1")
                expect(intDecrease.disabled).to.equal(true)

                await dialog.close({force: true})
            })

            it("resolves the full selected value map on confirm", async function ()
            {
                let resolvedValue = null
                const dialog = new AbilityScoreAdvancementDialog({
                    actor: createActor(),
                    viewModel: createAbilityScoreAdvancementViewModel({
                        actor: createActor(),
                        advancementConfiguration: {
                            cap: 1,
                            fixed: {},
                            locked: ["str", "dex", "con"],
                            max: 20,
                            points: 1
                        }
                    }),
                    controller: {
                        confirm: async value => { resolvedValue = value },
                        cancel: () => {}
                    },
                    logger: null
                })

                await dialog.render(true)

                dialog.element.querySelector(
                    "[data-action='increase'][data-ability-key='int']"
                ).click()
                await nextTick()

                dialog.element.querySelector("[data-action='confirm']").click()
                await nextTick()

                expect(resolvedValue).to.deep.equal({
                    str: 10,
                    dex: 10,
                    con: 10,
                    int: 11,
                    wis: 10,
                    cha: 10
                })

                if (dialog.rendered) {
                    await dialog.close({force: true})
                }
            })
        })
    }
)
