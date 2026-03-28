import { createTransformationGeneralChoiceController } from "../../ui/controllers/transformationGeneralChoiceController.js"
import { TransformationGeneralChoiceDialog } from "../../ui/dialogs/transformationGeneralChoiceDialog.js"
import { createTransformationGeneralChoiceViewModel } from "../../ui/viewModels/createTransformationGeneralChoiceViewModel.js"
import { wait } from "../helpers/wait.js"
import { teardownAllTest } from "../testLifecycle.js"

function nextTick()
{
    return new Promise(resolve => setTimeout(resolve, 0))
}

quench.registerBatch(
    "transformations.Dialogs.transformationGeneralChoiceDialog",
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

        // ---------------------------
        // ViewModel
        // ---------------------------

        describe("createTransformationGeneralChoiceViewModel", function()
        {
            it("maps choices correctly", function()
            {
                const choices = [
                    { icon: "modules/transformations/icons/DamageTypes/Fire.png", id: "fire", label: "Fire" },
                    { icon: "modules/transformations/icons/DamageTypes/Cold.png", id: "cold", label: "Cold" }
                ]

                const vm = createTransformationGeneralChoiceViewModel({
                    choices
                })

                expect(vm.choices.length).to.equal(2)

                expect(vm.choices[0]).to.deep.equal({
                    id: "fire",
                    icon: "modules/transformations/icons/DamageTypes/Fire.png",
                    label: "Fire"
                })
            })

            it("includes description in viewModel", function()
            {
                const vm = createTransformationGeneralChoiceViewModel({
                    choices: [],
                    description: "Some dramatic explanation."
                })

                expect(vm.description).to.equal("Some dramatic explanation.")
            })

            it("includes title in viewModel", function()
            {
                const vm = createTransformationGeneralChoiceViewModel({
                    choices: [],
                    title: "My custom title"
                })

                expect(vm.title).to.equal("My custom title")
            })

            it("defaults description to empty string", function()
            {
                const vm = createTransformationGeneralChoiceViewModel({
                    choices: []
                })

                expect(vm.description).to.equal("")
            })

            it("includes multi-choice metadata when more than one choice is required", function()
            {
                const vm = createTransformationGeneralChoiceViewModel({
                    choices: [
                        { icon: "modules/transformations/icons/DamageTypes/Fire.png", id: "fire", label: "Fire" }
                    ],
                    choiceCount: 2
                })

                expect(vm.choiceCount).to.equal(2)
                expect(vm.isMultiChoice).to.equal(true)
                expect(vm.choicesLeft).to.equal(2)
            })
        })

        // ---------------------------
        // Controller
        // ---------------------------

        describe("TransformationGeneralChoiceController", function()
        {
            it("resolves selected choice id", async function()
            {
                let resolvedValue = null

                const controller = createTransformationGeneralChoiceController({
                    actor: {},
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                await controller.choose("fire")

                expect(resolvedValue).to.equal("fire")
            })

            it("resolves null on cancel", function()
            {
                let resolvedValue = "something"

                const controller = createTransformationGeneralChoiceController({
                    actor: {},
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                controller.cancel()

                expect(resolvedValue).to.equal(null)
            })
        })

        // ---------------------------
        // Dialog (Button-based UI)
        // ---------------------------

        describe("TransformationGeneralChoiceDialog", function()
        {
            it("renders description when provided", async function()
            {
                const mockController = {
                    choose: async () => { },
                    cancel: () => { }
                }

                const viewModel = {
                    choices: [
                        { id: "fire", label: "Fire", icon: "modules/transformations/icons/DamageTypes/Fire.png" }
                    ],
                    description: "Choose wisely.",
                    title: "Custom title"
                }

                const dialog = new TransformationGeneralChoiceDialog({
                    actor: {},
                    viewModel,
                    controller: mockController,
                    options: {},
                    logger: null
                })

                await dialog.render(true)

                const description = dialog.element.querySelector(
                    ".transformation-general-choices-description"
                )

                expect(description).to.exist
                expect(description.textContent.trim()).to.equal("Choose wisely.")

                await dialog.close({ force: true })
            })

            it("does not render description when empty", async function()
            {
                const mockController = {
                    choose: async () => { },
                    cancel: () => { }
                }

                const viewModel = {
                    description: "",
                    choices: [
                        { id: "fire", label: "Fire", icon: "modules/transformations/icons/DamageTypes/Fire.png" }
                    ],
                    title: "Custom title"
                }

                const dialog = new TransformationGeneralChoiceDialog({
                    actor: {},
                    viewModel,
                    controller: mockController,
                    options: {},
                    logger: null
                })

                await dialog.render(true)

                const description = dialog.element.querySelector(
                    ".transformation-general-choices-description"
                )

                expect(description).to.equal(null)

                await dialog.close({ force: true })
            })

            it("calls controller.choose when a choice button is clicked", async function()
            {
                let chosenValue = null

                const mockController = {
                    choose: async value => { chosenValue = value },
                    cancel: () => { }
                }

                const viewModel = {
                    choices: [
                        { id: "fire", label: "Fire", icon: "modules/transformations/icons/DamageTypes/Fire.png" },
                        { id: "cold", label: "Cold", icon: "modules/transformations/icons/DamageTypes/Cold.png" }
                    ],
                    description: "",
                    title: "Custom title"
                }

                const dialog = new TransformationGeneralChoiceDialog({
                    actor: {},
                    viewModel,
                    controller: mockController,
                    options: {},
                    logger: null
                })

                await dialog.render(true)

                const buttons = dialog.element.querySelectorAll(".choice-button")

                expect(buttons.length).to.equal(2)

                buttons[0].click()

                await nextTick()

                expect(chosenValue).to.equal("fire")

                await dialog.close({ force: true })
            })

            it("renders a choice counter and disabled confirm button for multi-choice dialogs", async function()
            {
                const mockController = {
                    choose: async () => { },
                    cancel: () => { }
                }

                const viewModel = createTransformationGeneralChoiceViewModel({
                    choices: [
                        { id: "fire", label: "Fire", icon: "modules/transformations/icons/DamageTypes/Fire.png" },
                        { id: "cold", label: "Cold", icon: "modules/transformations/icons/DamageTypes/Cold.png" },
                        { id: "acid", label: "Acid", icon: "modules/transformations/icons/DamageTypes/Acid.png" }
                    ],
                    choiceCount: 2,
                    title: "Choose two"
                })

                const dialog = new TransformationGeneralChoiceDialog({
                    actor: {},
                    viewModel,
                    controller: mockController,
                    options: {},
                    logger: null
                })

                await dialog.render(true)

                const counter = dialog.element.querySelector("[data-choice-counter-value]")
                const confirmButton = dialog.element.querySelector("[data-action='choose']")

                expect(counter).to.exist
                expect(counter.textContent.trim()).to.equal("2")
                expect(confirmButton).to.exist
                expect(confirmButton.disabled).to.equal(true)

                await dialog.close({ force: true })
            })

            it("resolves an array of ids once the exact number of choices is selected", async function()
            {
                let chosenValues = null

                const mockController = {
                    choose: async value => { chosenValues = value },
                    cancel: () => { }
                }

                const viewModel = createTransformationGeneralChoiceViewModel({
                    choices: [
                        { id: "fire", label: "Fire", icon: "modules/transformations/icons/DamageTypes/Fire.png" },
                        { id: "cold", label: "Cold", icon: "modules/transformations/icons/DamageTypes/Cold.png" },
                        { id: "acid", label: "Acid", icon: "modules/transformations/icons/DamageTypes/Acid.png" }
                    ],
                    choiceCount: 2,
                    title: "Choose two"
                })

                const dialog = new TransformationGeneralChoiceDialog({
                    actor: {},
                    viewModel,
                    controller: mockController,
                    options: {},
                    logger: null
                })

                await dialog.render(true)

                const buttons = dialog.element.querySelectorAll(".choice-button")
                const counter = dialog.element.querySelector("[data-choice-counter-value]")
                const confirmButton = dialog.element.querySelector("[data-action='choose']")

                buttons[0].click()
                await nextTick()

                expect(counter.textContent.trim()).to.equal("1")
                expect(confirmButton.disabled).to.equal(true)

                buttons[1].click()
                await nextTick()

                expect(counter.textContent.trim()).to.equal("0")
                expect(confirmButton.disabled).to.equal(false)

                confirmButton.click()
                await nextTick()

                expect(chosenValues).to.deep.equal(["fire", "cold"])

                if (dialog.rendered) {
                    await dialog.close({ force: true })
                }
            })

            it("prevents selecting more than the allowed number of choices", async function()
            {
                const mockController = {
                    choose: async () => { },
                    cancel: () => { }
                }

                const viewModel = createTransformationGeneralChoiceViewModel({
                    choices: [
                        { id: "fire", label: "Fire", icon: "modules/transformations/icons/DamageTypes/Fire.png" },
                        { id: "cold", label: "Cold", icon: "modules/transformations/icons/DamageTypes/Cold.png" },
                        { id: "acid", label: "Acid", icon: "modules/transformations/icons/DamageTypes/Acid.png" }
                    ],
                    choiceCount: 2,
                    title: "Choose two"
                })

                const dialog = new TransformationGeneralChoiceDialog({
                    actor: {},
                    viewModel,
                    controller: mockController,
                    options: {},
                    logger: null
                })

                await dialog.render(true)

                const buttons = dialog.element.querySelectorAll(".choice-button")

                buttons[0].click()
                buttons[1].click()
                await nextTick()

                expect(buttons[2].disabled).to.equal(true)
                expect(dialog.selectedChoiceIds.has("fire")).to.equal(true)
                expect(dialog.selectedChoiceIds.has("cold")).to.equal(true)
                expect(dialog.selectedChoiceIds.has("acid")).to.equal(false)

                await dialog.close({ force: true })
            })
        })
    }
)
