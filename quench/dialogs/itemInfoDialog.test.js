
import { createItemInfoController } from "../../ui/controllers/ItemInfoController.js"

import { teardownAllTest } from "../testLifecycle.js"
import { wait } from "../helpers/wait.js"
import { createItemInfoViewModel } from "../../ui/viewModels/ItemInfoViewModel.js"
import { ItemInfoDialog } from "../../ui/dialogs/ItemInfoDialog.js"

quench.registerBatch(
    "transformations.Dialogs.itemInfo",
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

        describe("createItemInfoViewModel", function()
        {
            it("maps item data correctly", function()
            {
                const item = {
                    name: "Sword of Responsibility",
                    img: "systems/dnd5e/icons/svg/items/weapon.svg",
                    system: {
                        description: {
                            value: "<p>Sharp and morally complex.</p>"
                        }
                    }
                }

                const vm = createItemInfoViewModel({ item })

                expect(vm.name).to.equal("Sword of Responsibility")
                expect(vm.icon).to.equal("systems/dnd5e/icons/svg/items/weapon.svg")
                expect(vm.description).to.equal("<p>Sharp and morally complex.</p>")
            })

            it("defaults description to empty string", function()
            {
                const item = {
                    name: "Mysterious Pebble",
                    img: "systems/dnd5e/icons/svg/items/tool.svg",
                    system: {}
                }

                const vm = createItemInfoViewModel({ item })

                expect(vm.description).to.equal("")
            })
        })

        describe("ItemInfoController", function()
        {
            it("resolves true on continue", async function()
            {
                let resolvedValue = null

                const controller = createItemInfoController({
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                await controller.continue()

                expect(resolvedValue).to.equal(true)
            })

            it("resolves false on cancel if not continued", function()
            {
                let resolvedValue = "something dramatic"

                const controller = createItemInfoController({
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                controller.cancel()

                expect(resolvedValue).to.equal(false)
            })

            it("does not override true if cancel is called after continue", async function()
            {
                let resolvedValue = null

                const controller = createItemInfoController({
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                await controller.continue()
                controller.cancel()

                expect(resolvedValue).to.equal(true)
            })
        })

        describe("ItemInfoDialog", function()
        {
            it("renders icon, description and resolves true when Continue is clicked", async function()
            {
                let resolvedValue = null

                const mockController = {
                    continue: async () => { resolvedValue = true },
                    cancel: () => { }
                }

                const viewModel = {
                    name: "Sword of Testing",
                    icon: "systems/dnd5e/icons/svg/items/weapon.svg",
                    description: "<p>A blade forged in CI pipelines.</p>"
                }

                const dialog = new ItemInfoDialog({
                    item: {},
                    viewModel,
                    controller: mockController,
                    options: {},
                    logger: null
                })

                await dialog.render(true)

                const icon = dialog.element.querySelector(".item-icon img")
                const description = dialog.element.querySelector(".item-description")
                const button = dialog.element.querySelector("[data-action='continue']")

                expect(icon).to.exist
                expect(icon.getAttribute("src")).to.equal("systems/dnd5e/icons/svg/items/weapon.svg")

                expect(description).to.exist
                expect(description.innerHTML.trim()).to.equal("<p>A blade forged in CI pipelines.</p>")

                expect(button).to.exist

                button.click()

                await new Promise(resolve => setTimeout(resolve, 0))

                expect(resolvedValue).to.equal(true)

                await dialog.close({ force: true })
            })

            it("resolves false if dialog is closed without clicking Continue", async function()
            {
                let resolvedValue = null

                const mockController = {
                    continue: async () => { resolvedValue = true },
                    cancel: () => { resolvedValue = false }
                }

                const viewModel = {
                    name: "Unclicked Relic",
                    icon: "systems/dnd5e/icons/svg/activity/cast.svg",
                    description: "<p>Ignored by fate.</p>"
                }

                const dialog = new ItemInfoDialog({
                    item: {},
                    viewModel,
                    controller: mockController,
                    options: {},
                    logger: null
                })

                await dialog.render(true)

                await dialog.close({ force: true })

                expect(resolvedValue).to.equal(false)
            })
        })
    }
)