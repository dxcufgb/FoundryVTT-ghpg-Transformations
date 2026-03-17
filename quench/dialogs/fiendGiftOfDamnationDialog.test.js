import { FiendGiftOfDamnationDialog } from "../../ui/dialogs/fiendGiftOfDamnationDialog.js"
import { createFiendGiftOfDamnationViewModel } from "../../ui/viewModels/createFiendGiftOfDamnationViewModel.js"
import { wait } from "../helpers/wait.js"
import { teardownAllTest } from "../testLifecycle.js"

function nextTick()
{
    return new Promise(resolve => setTimeout(resolve, 0))
}

quench.registerBatch(
    "transformations.Dialogs.fiendGiftOfDamnationDialog",
    ({ describe, it, expect }) =>
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

        describe("createFiendGiftOfDamnationViewModel", function()
        {
            it("filters gifts by stage and marks the active gift", function()
            {
                const actor = {
                    effects: [
                        {
                            name: "Gift of Joyous Life",
                            flags: {
                                transformations: {
                                    giftOfDamnation: true,
                                    giftOfDamnationId: "giftOfJoyousLife"
                                }
                            }
                        }
                    ]
                }

                const viewModel = createFiendGiftOfDamnationViewModel({
                    actor,
                    stage: 1
                })

                expect(viewModel.currentGiftName).to.equal("Gift of Joyous Life")
                expect(viewModel.currentGiftId).to.equal("giftOfJoyousLife")
                expect(viewModel.options.map(option => option.value)).to.deep.equal([
                    "giftOfJoyousLife",
                    "giftOfProdigiousTalent",
                    "giftOfUnsurpassedFortune"
                ])
                expect(
                    viewModel.options.find(option => option.value === "giftOfJoyousLife")?.selected
                ).to.equal(true)
            })

            it("includes higher-stage gifts once the stage requirement is met", function()
            {
                const viewModel = createFiendGiftOfDamnationViewModel({
                    actor: { effects: [] },
                    stage: 5
                })

                expect(viewModel.options.map(option => option.value)).to.deep.equal([
                    "giftOfJoyousLife",
                    "giftOfProdigiousTalent",
                    "giftOfUnsurpassedFortune",
                    "giftOfLiberatingFreedom",
                    "giftOfUnfetteredGlory"
                ])
            })
        })

        describe("FiendGiftOfDamnationDialog", function()
        {
            it("renders the active gift text and updates the visible description when the selection changes", async function()
            {
                const dialog = new FiendGiftOfDamnationDialog({
                    viewModel: {
                        currentGiftName: "Gift of Joyous Life",
                        options: [
                            {
                                value: "giftOfJoyousLife",
                                label: "Gift of Joyous Life",
                                description: "Heal when bloodied.",
                                selected: true
                            },
                            {
                                value: "giftOfProdigiousTalent",
                                label: "Gift of Prodigious Talent",
                                description: "Turn low checks into a cost.",
                                selected: false
                            }
                        ]
                    },
                    controller: {
                        confirm: async () => { },
                        cancel: () => { }
                    },
                    logger: null
                })

                await dialog.render(true)

                const activeGiftText = dialog.element.textContent
                const select = dialog.element.querySelector("[data-action='gift']")
                const descriptions = dialog.element.querySelectorAll(".fiend-gift-description")

                expect(activeGiftText).to.contain("Active Gift: Gift of Joyous Life")
                expect(descriptions[0].hidden).to.equal(false)
                expect(descriptions[1].hidden).to.equal(true)

                select.value = "giftOfProdigiousTalent"
                select.dispatchEvent(new Event("change"))
                await nextTick()

                expect(descriptions[0].hidden).to.equal(true)
                expect(descriptions[1].hidden).to.equal(false)

                await dialog.close({ force: true })
            })

            it("calls controller.confirm with the selected gift id when OK is clicked", async function()
            {
                let confirmedGiftId = null

                const dialog = new FiendGiftOfDamnationDialog({
                    viewModel: {
                        currentGiftName: "None",
                        options: [
                            {
                                value: "giftOfJoyousLife",
                                label: "Gift of Joyous Life",
                                description: "Heal when bloodied.",
                                selected: true
                            },
                            {
                                value: "giftOfProdigiousTalent",
                                label: "Gift of Prodigious Talent",
                                description: "Turn low checks into a cost.",
                                selected: false
                            }
                        ]
                    },
                    controller: {
                        confirm: async giftId => { confirmedGiftId = giftId },
                        cancel: () => { }
                    },
                    logger: null
                })

                await dialog.render(true)

                const select = dialog.element.querySelector("[data-action='gift']")
                const confirmButton = dialog.element.querySelector("[data-action='confirm']")

                select.value = "giftOfProdigiousTalent"
                confirmButton.click()
                await nextTick()

                expect(confirmedGiftId).to.equal("giftOfProdigiousTalent")

                if (dialog.rendered) {
                    await dialog.close({ force: true })
                }
            })

            it("calls controller.cancel when closed without confirming", async function()
            {
                let wasCancelled = false

                const dialog = new FiendGiftOfDamnationDialog({
                    viewModel: {
                        currentGiftName: "None",
                        options: [
                            {
                                value: "giftOfJoyousLife",
                                label: "Gift of Joyous Life",
                                description: "Heal when bloodied.",
                                selected: true
                            }
                        ]
                    },
                    controller: {
                        confirm: async () => { },
                        cancel: () => { wasCancelled = true }
                    },
                    logger: null
                })

                await dialog.render(true)
                await dialog.close({ force: true })

                expect(wasCancelled).to.equal(true)
            })
        })
    }
)
