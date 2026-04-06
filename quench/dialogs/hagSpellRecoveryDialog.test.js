import { createHagSpellRecoveryController }
    from "../../ui/controllers/hagSpellRecoveryController.js"
import { TransformationsSpellSlotRecoveryDialog }
    from "../../ui/dialogs/transformationsSpellSlotRecoveryDialog.js"
import { createHagSpellRecoveryViewModel }
    from "../../ui/viewModels/createHagSpellRecoveryViewModel.js"
import { wait } from "../helpers/wait.js"
import { teardownAllTest } from "../testLifecycle.js"

function nextTick()
{
    return new Promise(resolve => setTimeout(resolve, 0))
}

function createActorForHagSpellRecovery({
    levels = 6,
    hitDice = 3,
    spells = {}
} = {})
{
    return {
        items: [
            {
                type: "class",
                system: {
                    levels,
                    hd: {
                        value: hitDice
                    }
                }
            }
        ],
        system: {
            details: {
                level: levels
            },
            spells: {
                spell1: {
                    value: 0,
                    override: 0,
                    max: 0
                },
                spell2: {
                    value: 0,
                    override: 0,
                    max: 0
                },
                spell3: {
                    value: 0,
                    override: 0,
                    max: 0
                },
                spell4: {
                    value: 0,
                    override: 0,
                    max: 0
                },
                pact: {
                    value: 0,
                    max: 0,
                    level: 0
                },
                ...spells
            }
        }
    }
}

function getGroups(dialog)
{
    return Array.from(
        dialog.element.querySelectorAll("[data-slot-group]")
    )
}

function getRadios(group)
{
    return Array.from(group.querySelectorAll("[data-slot-option]"))
}

function findGroupByLevel(dialog, level)
{
    return getGroups(dialog).find(group =>
        getRadios(group)[0]?.dataset?.slotLevel === String(level)
    ) ?? null
}

quench.registerBatch(
    "transformations.Dialogs.transformationsSpellSlotRecoveryDialog.hag",
    ({describe, it, expect}) =>
    {
        const existingActorIds = game.actors.map(actor => actor.id)

        after(async function()
        {
            await wait(200)

            const existingIdSet = new Set(existingActorIds)

            const testActorIds = game.actors
            .filter(actor => !existingIdSet.has(actor.id))
            .map(actor => actor.id)

            await teardownAllTest(testActorIds)
        })

        describe("createHagSpellRecoveryViewModel", function()
        {
            it("filters recoverable spell slots by character level cap and available hit dice", function()
            {
                const actor = createActorForHagSpellRecovery({
                    levels: 7,
                    hitDice: 2,
                    spells: {
                        spell1: {
                            value: 0,
                            override: 2
                        },
                        spell2: {
                            value: 0,
                            override: 1
                        },
                        spell3: {
                            value: 0,
                            override: 1
                        }
                    }
                })

                const viewModel = createHagSpellRecoveryViewModel({
                    actor
                })

                expect(viewModel.characterLevel).to.equal(7)
                expect(viewModel.availableHitDice).to.equal(2)
                expect(viewModel.maxRecoverableLevel).to.equal(3)
                expect(viewModel.hasRecoverableSlots).to.equal(true)
                expect(viewModel.groups.map(group => group.level)).to.deep.equal([
                    1,
                    2
                ])

                const level1Group =
                    viewModel.groups.find(group => group.level === 1)
                const level2Group =
                    viewModel.groups.find(group => group.level === 2)

                expect(level1Group.options.length).to.equal(2)
                expect(level2Group.options.length).to.equal(1)
            })

            it("reports no recoverable slots when there are no eligible expended spell slots", function()
            {
                const actor = createActorForHagSpellRecovery({
                    levels: 3,
                    hitDice: 1,
                    spells: {
                        spell1: {
                            value: 1,
                            override: 1
                        },
                        spell2: {
                            value: 0,
                            override: 1
                        }
                    }
                })

                const viewModel = createHagSpellRecoveryViewModel({
                    actor
                })

                expect(viewModel.maxRecoverableLevel).to.equal(1)
                expect(viewModel.hasRecoverableSlots).to.equal(false)
                expect(viewModel.groups).to.deep.equal([])
            })
        })

        describe("HagSpellRecoveryController", function()
        {
            it("resolves the selected spell slot on confirm", async function()
            {
                let resolvedValue = null

                const controller = createHagSpellRecoveryController({
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                const selectedSpellSlot = {
                    slotKey: "spell2",
                    level: 2,
                    cost: 2,
                    slotType: "spell"
                }

                await controller.confirm(selectedSpellSlot)

                expect(resolvedValue).to.deep.equal(selectedSpellSlot)
            })

            it("resolves null on cancel", function()
            {
                let resolvedValue = "pending"

                const controller = createHagSpellRecoveryController({
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                controller.cancel()

                expect(resolvedValue).to.equal(null)
            })
        })

        describe("TransformationsSpellSlotRecoveryDialog (Hag)", function()
        {
            it("renders eligible slot groups and updates selected cost when a slot is chosen", async function()
            {
                const dialog = new TransformationsSpellSlotRecoveryDialog({
                    viewModel: createHagSpellRecoveryViewModel({
                        actor: createActorForHagSpellRecovery({
                            levels: 6,
                            hitDice: 3,
                            spells: {
                                spell1: {
                                    value: 0,
                                    override: 2
                                },
                                spell2: {
                                    value: 0,
                                    override: 1
                                }
                            }
                        })
                    }),
                    controller: {
                        confirm: async () => {},
                        cancel: () => {}
                    },
                    logger: null
                })

                await dialog.render(true)

                const groups = getGroups(dialog)
                const level1Group = findGroupByLevel(dialog, 1)
                const level2Group = findGroupByLevel(dialog, 2)
                const selectedCost =
                    dialog.element.querySelector("[data-selection-summary]")
                const confirmButton =
                    dialog.element.querySelector("[data-action='confirm']")

                expect(groups.length).to.equal(2)
                expect(level1Group).to.exist
                expect(level2Group).to.exist
                expect(selectedCost.textContent.trim()).to.equal("0")
                expect(confirmButton.disabled).to.equal(true)

                const level2Radios = getRadios(level2Group)
                level2Radios[0].click()
                await nextTick()

                expect(level2Radios[0].checked).to.equal(true)
                expect(selectedCost.textContent.trim()).to.equal("2")
                expect(confirmButton.disabled).to.equal(false)

                await dialog.close({force: true})
            })

            it("calls controller.confirm with the selected spell slot when Recover Spell Slot is clicked", async function()
            {
                let confirmedValue = null

                const dialog = new TransformationsSpellSlotRecoveryDialog({
                    viewModel: createHagSpellRecoveryViewModel({
                        actor: createActorForHagSpellRecovery({
                            levels: 6,
                            hitDice: 3,
                            spells: {
                                spell1: {
                                    value: 0,
                                    override: 1
                                },
                                spell2: {
                                    value: 0,
                                    override: 1
                                }
                            }
                        })
                    }),
                    controller: {
                        confirm: async value => { confirmedValue = value },
                        cancel: () => {}
                    },
                    logger: null
                })

                await dialog.render(true)

                const level2Group = findGroupByLevel(dialog, 2)
                const radios = getRadios(level2Group)
                const confirmButton =
                    dialog.element.querySelector("[data-action='confirm']")

                radios[0].click()
                await nextTick()

                confirmButton.click()
                await nextTick()

                expect(confirmedValue).to.deep.equal({
                    slotKey: "spell2",
                    level: 2,
                    cost: 2,
                    slotType: "spell"
                })

                if (dialog.rendered) {
                    await dialog.close({force: true})
                }
            })

            it("calls controller.cancel when closed without confirming", async function()
            {
                let cancelled = false

                const dialog = new TransformationsSpellSlotRecoveryDialog({
                    viewModel: createHagSpellRecoveryViewModel({
                        actor: createActorForHagSpellRecovery({
                            levels: 3,
                            hitDice: 1,
                            spells: {
                                spell1: {
                                    value: 0,
                                    override: 1
                                }
                            }
                        })
                    }),
                    controller: {
                        confirm: async () => {},
                        cancel: () => { cancelled = true }
                    },
                    logger: null
                })

                await dialog.render(true)
                await dialog.close({force: true})

                expect(cancelled).to.equal(true)
            })
        })
    }
)
