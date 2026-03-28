import { createFiendUnbridledPowerSpellSlotRecoveryController }
    from "../../ui/controllers/fiendUnbridledPowerSpellSlotRecoveryController.js"
import { FiendUnbridledPowerSpellSlotRecoveryDialog }
    from "../../ui/dialogs/fiendUnbridledPowerSpellSlotRecoveryDialog.js"
import { createFiendUnbridledPowerSpellSlotRecoveryViewModel }
    from "../../ui/viewModels/createFiendUnbridledPowerSpellSlotRecoveryViewModel.js"
import { wait } from "../helpers/wait.js"
import { teardownAllTest } from "../testLifecycle.js"

function nextTick()
{
    return new Promise(resolve => setTimeout(resolve, 0))
}

function createActorWithSpellSlots(spells = {})
{
    return {
        system: {
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
        dialog.element.querySelectorAll(
            ".fiend-unbridled-power-spell-slot-recovery__group"
        )
    )
}

function getCheckboxes(group)
{
    return Array.from(group.querySelectorAll("[data-slot-checkbox]"))
}

quench.registerBatch(
    "transformations.Dialogs.fiendUnbridledPowerSpellSlotRecoveryDialog",
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

        describe("createFiendUnbridledPowerSpellSlotRecoveryViewModel", function()
        {
            it("groups recoverable slots by level and includes each missing slot as an option", function()
            {
                const actor = createActorWithSpellSlots({
                    spell1: {
                        value: 1,
                        override: 3
                    },
                    spell2: {
                        value: 0,
                        override: 2
                    },
                    pact: {
                        value: 0,
                        max: 1,
                        level: 2
                    }
                })

                const viewModel =
                    createFiendUnbridledPowerSpellSlotRecoveryViewModel({
                        actor,
                        amount: 4
                    })

                expect(viewModel.hasRecoverableSlots).to.equal(true)
                expect(viewModel.groups.map(group => group.level)).to.deep.equal([
                    1,
                    2
                ])

                const level1Group =
                    viewModel.groups.find(group => group.level === 1)
                const level2Group =
                    viewModel.groups.find(group => group.level === 2)

                expect(level1Group.label).to.equal("Level 1")
                expect(level1Group.options.length).to.equal(2)
                expect(level1Group.options.every(option =>
                    option.slotKey === "spell1" && option.cost === 1
                )).to.equal(true)

                expect(level2Group.label).to.equal("Level 2")
                expect(level2Group.options.length).to.equal(3)
                expect(level2Group.options.filter(option =>
                    option.slotKey === "spell2"
                ).length).to.equal(2)
                expect(level2Group.options.filter(option =>
                    option.slotKey === "pact"
                ).length).to.equal(1)
            })

            it("reports no recoverable slots when all slot values are full", function()
            {
                const actor = createActorWithSpellSlots({
                    spell1: {
                        value: 2,
                        override: 2
                    },
                    spell2: {
                        value: 1,
                        override: 1
                    }
                })

                const viewModel =
                    createFiendUnbridledPowerSpellSlotRecoveryViewModel({
                        actor,
                        amount: 5
                    })

                expect(viewModel.hasRecoverableSlots).to.equal(false)
                expect(viewModel.groups).to.deep.equal([])
            })
        })

        describe("FiendUnbridledPowerSpellSlotRecoveryController", function()
        {
            it("resolves the selected slots on confirm", async function()
            {
                let resolvedValue = null

                const controller =
                    createFiendUnbridledPowerSpellSlotRecoveryController({
                        resolve: value => { resolvedValue = value },
                        logger: null
                    })

                const selectedSpellSlots = [
                    {
                        slotKey: "spell1",
                        level: 1,
                        cost: 1,
                        slotType: "spell"
                    }
                ]

                await controller.confirm(selectedSpellSlots)

                expect(resolvedValue).to.deep.equal(selectedSpellSlots)
            })

            it("resolves null on cancel", function()
            {
                let resolvedValue = "pending"

                const controller =
                    createFiendUnbridledPowerSpellSlotRecoveryController({
                        resolve: value => { resolvedValue = value },
                        logger: null
                    })

                controller.cancel()

                expect(resolvedValue).to.equal(null)
            })
        })

        describe("FiendUnbridledPowerSpellSlotRecoveryDialog", function()
        {
            it("renders slot groups and enforces contiguous checkbox selection within a row", async function()
            {
                const dialog = new FiendUnbridledPowerSpellSlotRecoveryDialog({
                    viewModel:
                        createFiendUnbridledPowerSpellSlotRecoveryViewModel({
                            actor: createActorWithSpellSlots({
                                spell1: {
                                    value: 0,
                                    override: 3
                                },
                                spell2: {
                                    value: 0,
                                    override: 2
                                }
                            }),
                            amount: 4
                        }),
                    controller: {
                        confirm: async () => {},
                        cancel: () => {}
                    },
                    logger: null
                })

                await dialog.render(true)

                const groups = getGroups(dialog)
                const level1Group = groups.find(group =>
                    group.querySelector(
                        ".fiend-unbridled-power-spell-slot-recovery__level"
                    )?.textContent?.trim() === "1"
                )
                const level2Group = groups.find(group =>
                    group.querySelector(
                        ".fiend-unbridled-power-spell-slot-recovery__level"
                    )?.textContent?.trim() === "2"
                )

                expect(groups.length).to.equal(2)
                expect(level1Group).to.exist
                expect(level2Group).to.exist

                const level1Checkboxes = getCheckboxes(level1Group)
                const level2Checkboxes = getCheckboxes(level2Group)
                const remaining = dialog.element.querySelector("[data-remaining]")

                expect(level1Checkboxes.length).to.equal(3)
                expect(level2Checkboxes.length).to.equal(2)
                expect(remaining.textContent.trim()).to.equal("4")

                level1Checkboxes[2].click()
                await nextTick()

                expect(level1Checkboxes.every(checkbox => checkbox.checked)).to.equal(true)
                expect(remaining.textContent.trim()).to.equal("1")
                expect(level2Checkboxes.every(checkbox => checkbox.disabled)).to.equal(true)

                level1Checkboxes[0].click()
                await nextTick()

                expect(level1Checkboxes.some(checkbox => checkbox.checked)).to.equal(false)
                expect(remaining.textContent.trim()).to.equal("4")
                expect(level2Checkboxes.some(checkbox => checkbox.disabled)).to.equal(false)

                level2Checkboxes[1].click()
                await nextTick()

                expect(level2Checkboxes[0].checked).to.equal(true)
                expect(level2Checkboxes[1].checked).to.equal(true)
                expect(remaining.textContent.trim()).to.equal("0")

                await dialog.close({force: true})
            })

            it("calls controller.confirm with the selected contiguous slots when OK is clicked", async function()
            {
                let confirmedValue = null

                const dialog = new FiendUnbridledPowerSpellSlotRecoveryDialog({
                    viewModel:
                        createFiendUnbridledPowerSpellSlotRecoveryViewModel({
                            actor: createActorWithSpellSlots({
                                spell1: {
                                    value: 0,
                                    override: 3
                                },
                                spell2: {
                                    value: 0,
                                    override: 1
                                }
                            }),
                            amount: 3
                        }),
                    controller: {
                        confirm: async value => { confirmedValue = value },
                        cancel: () => {}
                    },
                    logger: null
                })

                await dialog.render(true)

                const groups = getGroups(dialog)
                const level1Group = groups.find(group =>
                    group.querySelector(
                        ".fiend-unbridled-power-spell-slot-recovery__level"
                    )?.textContent?.trim() === "1"
                )
                const checkboxes = getCheckboxes(level1Group)
                const confirmButton =
                    dialog.element.querySelector("[data-action='confirm']")

                expect(confirmButton.disabled).to.equal(true)

                checkboxes[1].click()
                await nextTick()

                expect(confirmButton.disabled).to.equal(false)

                confirmButton.click()
                await nextTick()

                expect(confirmedValue).to.deep.equal([
                    {
                        slotKey: "spell1",
                        level: 1,
                        cost: 1,
                        slotType: "spell"
                    },
                    {
                        slotKey: "spell1",
                        level: 1,
                        cost: 1,
                        slotType: "spell"
                    }
                ])

                if (dialog.rendered) {
                    await dialog.close({force: true})
                }
            })

            it("calls controller.cancel when closed without confirming", async function()
            {
                let cancelled = false

                const dialog = new FiendUnbridledPowerSpellSlotRecoveryDialog({
                    viewModel:
                        createFiendUnbridledPowerSpellSlotRecoveryViewModel({
                            actor: createActorWithSpellSlots({
                                spell1: {
                                    value: 0,
                                    override: 2
                                }
                            }),
                            amount: 2
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
