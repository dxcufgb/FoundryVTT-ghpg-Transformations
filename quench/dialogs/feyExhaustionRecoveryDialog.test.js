import { createFeyExhaustionRecoveryController } from "../../ui/controllers/feyExhaustionRecoveryController.js"
import { FeyExhaustionRecoveryDialog } from "../../ui/dialogs/feyExhaustionRecoveryDialog.js"
import { createFeyExhaustionRecoveryViewModel } from "../../ui/viewModels/createFeyExhaustionRecoveryViewModel.js"
import { wait } from "../helpers/wait.js"
import { teardownAllTest } from "../testLifecycle.js"

quench.registerBatch(
    "transformations.Dialogs.feyExhaustionRecovery",
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


        describe("createFeyExhaustionRecoveryViewModel", function()
        {

            it("calculates maxRecoverable correctly", function()
            {
                const vm = createFeyExhaustionRecoveryViewModel({
                    stage: 2,
                    exhaustion: 5,
                    hitDiceAvailable: 6
                })

                expect(vm.maxRecoverable).to.equal(3)
            })


            it("limits recovery by exhaustion", function()
            {
                const vm = createFeyExhaustionRecoveryViewModel({
                    stage: 2,
                    exhaustion: 2,
                    hitDiceAvailable: 10
                })

                expect(vm.maxRecoverable).to.equal(2)
            })


            it("generates correct recovery options", function()
            {
                const vm = createFeyExhaustionRecoveryViewModel({
                    stage: 2,
                    exhaustion: 5,
                    hitDiceAvailable: 6
                })

                expect(vm.options.length).to.equal(3)

                expect(vm.options[0]).to.deep.equal({
                    value: 1,
                    cost: 2
                })

                expect(vm.options[2]).to.deep.equal({
                    value: 3,
                    cost: 6
                })
            })


            it("generates empty options if no recovery possible", function()
            {
                const vm = createFeyExhaustionRecoveryViewModel({
                    stage: 5,
                    exhaustion: 3,
                    hitDiceAvailable: 2
                })

                expect(vm.maxRecoverable).to.equal(0)
                expect(vm.options.length).to.equal(0)
            })

        })


        describe("FeyExhaustionRecoveryController", function()
        {

            it("resolves selected amount on confirm", async function()
            {
                let resolvedValue = null

                const controller = createFeyExhaustionRecoveryController({
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                await controller.confirm(2)

                expect(resolvedValue).to.equal(2)
            })


            it("resolves null on cancel", function()
            {
                let resolvedValue = "dramatic tension"

                const controller = createFeyExhaustionRecoveryController({
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                controller.cancel()

                expect(resolvedValue).to.equal(null)
            })


            it("does not override confirm result when cancel happens after confirm", async function()
            {
                let resolvedValue = null

                const controller = createFeyExhaustionRecoveryController({
                    resolve: value => { resolvedValue = value },
                    logger: null
                })

                await controller.confirm(1)
                controller.cancel()

                expect(resolvedValue).to.equal(1)
            })

        })


        describe("FeyExhaustionRecoveryDialog", function()
        {

            it("renders recovery options and resolves selected value", async function()
            {
                let resolvedValue = null

                const mockController = {
                    confirm: async amount => { resolvedValue = amount },
                    cancel: () => { }
                }

                const viewModel = createFeyExhaustionRecoveryViewModel({
                    stage: 2,
                    exhaustion: 5,
                    hitDiceAvailable: 6
                })

                const dialog = new FeyExhaustionRecoveryDialog({
                    viewModel,
                    controller: mockController,
                    logger: null
                })

                await dialog.render(true)

                const select = dialog.element.querySelector("[data-action='amount']")
                const confirmBtn = dialog.element.querySelector("[data-action='confirm']")

                expect(select).to.exist
                expect(confirmBtn).to.exist

                select.value = "2"

                confirmBtn.click()

                await new Promise(resolve => setTimeout(resolve, 0))

                expect(resolvedValue).to.equal(2)

                await dialog.close({ force: true })
            })

            it("resolves null when dialog is closed without confirming", async function()
            {
                let resolvedValue = null

                const mockController = {
                    confirm: async amount => { resolvedValue = amount },
                    cancel: () => { resolvedValue = null }
                }

                const viewModel = createFeyExhaustionRecoveryViewModel({
                    stage: 2,
                    exhaustion: 5,
                    hitDiceAvailable: 6
                })

                const dialog = new FeyExhaustionRecoveryDialog({
                    viewModel,
                    controller: mockController,
                    logger: null
                })

                await dialog.render(true)

                await dialog.close({ force: true })

                expect(resolvedValue).to.equal(null)
            })

        })

    })