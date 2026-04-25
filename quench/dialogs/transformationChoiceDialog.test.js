import { createTransformationStageChoiceController } from "../../ui/controllers/transformationStageChoiceController.js"
import { TransformationChoiceDialog } from "../../ui/dialogs/TransformationChoiceDialog.js"
import { createTransformationStageChoiceViewModel } from "../../ui/viewModels/createTransformationStageChoiceViewModel.js"

function nextTick()
{
    return new Promise(resolve => setTimeout(resolve, 0))
}

quench.registerBatch(
    "transformations.Dialogs.transformationChoiceDialog",
    ({ describe, it, expect }) =>
    {
        describe("createTransformationStageChoiceViewModel", function()
        {
            it("includes multi-choice metadata when more than one choice is required", function()
            {
                const viewModel = createTransformationStageChoiceViewModel({
                    choices: [
                        {
                            uuid: "Compendium.choice-1",
                            name: "Choice 1",
                            img: "choice-1.png",
                            description: "<p>One</p>"
                        }
                    ],
                    choiceCount: 2
                })

                expect(viewModel.choiceCount).to.equal(2)
                expect(viewModel.isMultiChoice).to.equal(true)
                expect(viewModel.choicesLeft).to.equal(2)
                expect(viewModel.selectionInputType).to.equal("checkbox")
                expect(viewModel.choices[0].id).to.equal("Compendium.choice-1")
            })
        })

        describe("createTransformationStageChoiceController", function()
        {
            it("resolves an array selection unchanged", async function()
            {
                let resolvedValue = null

                const controller = createTransformationStageChoiceController({
                    actor: {},
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                await controller.choose([
                    "Compendium.choice-1",
                    "Compendium.choice-2"
                ])

                expect(resolvedValue).to.deep.equal([
                    "Compendium.choice-1",
                    "Compendium.choice-2"
                ])
            })
        })

        describe("TransformationChoiceDialog", function()
        {
            it("resolves a single uuid when the confirm button is pressed", async function()
            {
                let chosenValue = null

                const dialog = new TransformationChoiceDialog({
                    actor: {},
                    viewModel: createTransformationStageChoiceViewModel({
                        choices: [
                            {
                                uuid: "Compendium.choice-1",
                                name: "Choice 1",
                                img: "choice-1.png",
                                description: "<p>One</p>"
                            },
                            {
                                uuid: "Compendium.choice-2",
                                name: "Choice 2",
                                img: "choice-2.png",
                                description: "<p>Two</p>"
                            }
                        ]
                    }),
                    controller: createTransformationStageChoiceController({
                        actor: {},
                        resolve: value => { chosenValue = value },
                        logger: null
                    }),
                    options: {},
                    logger: null
                })

                await dialog.render(true)

                const choiceInputs = dialog.element.querySelectorAll(
                    "input[name='choice']"
                )
                const confirmButton = dialog.element.querySelector(
                    "[data-action='choose']"
                )

                choiceInputs[0].click()
                await nextTick()

                expect(confirmButton.disabled).to.equal(false)

                confirmButton.click()
                await nextTick()

                expect(chosenValue).to.equal("Compendium.choice-1")

                if (dialog.rendered) {
                    await dialog.close({ force: true })
                }
            })

            it("requires the exact number of selected choices before confirming", async function()
            {
                let chosenValue = null

                const dialog = new TransformationChoiceDialog({
                    actor: {},
                    viewModel: createTransformationStageChoiceViewModel({
                        choices: [
                            {
                                uuid: "Compendium.choice-1",
                                name: "Choice 1",
                                img: "choice-1.png",
                                description: "<p>One</p>"
                            },
                            {
                                uuid: "Compendium.choice-2",
                                name: "Choice 2",
                                img: "choice-2.png",
                                description: "<p>Two</p>"
                            },
                            {
                                uuid: "Compendium.choice-3",
                                name: "Choice 3",
                                img: "choice-3.png",
                                description: "<p>Three</p>"
                            }
                        ],
                        choiceCount: 2
                    }),
                    controller: createTransformationStageChoiceController({
                        actor: {},
                        resolve: value => { chosenValue = value },
                        logger: null
                    }),
                    options: {},
                    logger: null
                })

                await dialog.render(true)

                const choiceInputs = dialog.element.querySelectorAll(
                    "input[name='choice']"
                )
                const footer = dialog.element.querySelector(".choice-footer")
                const counter = dialog.element.querySelector(
                    "[data-choice-counter-value]"
                )
                const confirmButton = dialog.element.querySelector(
                    "[data-action='choose']"
                )

                expect(footer.hidden).to.equal(true)

                choiceInputs[0].click()
                await nextTick()

                expect(footer.hidden).to.equal(false)
                expect(counter.textContent.trim()).to.equal("1")
                expect(confirmButton.disabled).to.equal(true)

                choiceInputs[1].click()
                await nextTick()

                expect(counter.textContent.trim()).to.equal("0")
                expect(confirmButton.disabled).to.equal(false)
                expect(choiceInputs[2].disabled).to.equal(true)

                confirmButton.click()
                await nextTick()

                expect(chosenValue).to.deep.equal([
                    "Compendium.choice-1",
                    "Compendium.choice-2"
                ])

                if (dialog.rendered) {
                    await dialog.close({ force: true })
                }
            })
        })
    }
)
