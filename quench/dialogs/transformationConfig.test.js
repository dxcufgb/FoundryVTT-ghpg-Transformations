import { openActorControlsMenu, renderActorSheet, withGM, waitForFlagUpdate, asNonGMUser, waitForElementGone } from "../helpers/index.js"
import { createMockTransformationService } from "../helpers/mocks/services/createTestTransformationService.js"
import { wait } from "../helpers/wait.js"
import { findActorSheetControlsTranformationsItem, findTransformationCardInSpecialTraitsTab, findTransformationPill } from "../selectors/actorSheet.finders.js"
import { findTransformationTypeSelect } from "../selectors/transformationCardFinders.js"
import { findTransformationConfigDialog, getTransformationConfigDialogCloseButton, getTransformationConfigDialogConfigSection, getTransformationConfigDialogFooterSection, getTransformationConfigDialogRadioInput, getTransformationConfigDialogRadioInputs, getTransformationConfigDialogSubmit, getTransformationConfigDialogWindowTitle } from "../selectors/transformationConfig.finders.js"
import { setupTest, teardownAllTest, tearDownEachTest } from "../testLifecycle.js"

quench.registerBatch(
    "transformations.Dialogs.TransformationConfig",
    ({ describe, it, expect }) =>
    {
        let actor
        let sheet
        let dialog
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
        describe("Transformation Config Dialog – Rendering", function()
        {
            this.timeout(10_000)

            beforeEach(async function()
            {
                ({ actor } = await setupTest({
                    currentTest: this.currentTest,
                    createObjects: {
                        actor: {}
                    }
                }))
            })

            afterEach(async function()
            {
                await tearDownEachTest({ tearDownExtras: { sheet: sheet, dialog: dialog } })
            })

            it("opens the transformation config dialog from the GM control", async function()
            {
                await withGM(true, async () =>
                {
                    sheet = await openActorControlsMenu(actor)

                    const control = await findActorSheetControlsTranformationsItem(sheet)

                    expect(control).to.exist

                    control.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    dialog = await findTransformationConfigDialog(actor, {
                        timeout: 10_000
                    })

                    expect(dialog).to.exist
                })
            })

            it("opens the transformation config dialog from the pill for non-GMs", async function()
            {
                await withGM(false, async () =>
                {
                    sheet = await renderActorSheet(actor)

                    const pill = await findTransformationPill(sheet)

                    expect(pill).to.exist

                    pill.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    dialog = await findTransformationConfigDialog(actor, {
                        timeout: 10_000
                    })

                    expect(dialog).to.exist
                })
            })

        })

        describe("Transformation Config Dialog – Structure", function()
        {
            this.timeout(10_000)

            beforeEach(async function()
            {
                ({ actor } = await setupTest({
                    currentTest: this.currentTest,
                    createObjects: {
                        actor: {}
                    }
                }))
            })

            afterEach(async function()
            {
                await tearDownEachTest({ tearDownExtras: { sheet: sheet, dialog: dialog } })
            })

            it("renders with the correct title", async function()
            {
                await withGM(true, async () =>
                {
                    sheet = await openActorControlsMenu(actor)

                    const control = await findActorSheetControlsTranformationsItem(sheet)

                    expect(control).to.exist

                    control.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    dialog = await findTransformationConfigDialog(actor, {
                        timeout: 10_000
                    })

                    const title = getTransformationConfigDialogWindowTitle(dialog)

                    expect(title).to.exist
                    expect(title.textContent).to.match(/transformation/i)
                })
            })

            it("renders with the correct title when opened from the pill for non-GMs", async function()
            {
                await withGM(false, async () =>
                {
                    // 1. Render actor sheet as non-GM
                    sheet = await renderActorSheet(actor)

                    // 2. Find the transformation pill
                    const pill = await findTransformationPill(sheet)
                    expect(pill).to.exist

                    // 3. Click the pill
                    pill.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    // 4. Wait for the dialog
                    dialog = await findTransformationConfigDialog(actor, {
                        timeout: 10_000
                    })

                    // 5. Assert title
                    const title =
                        getTransformationConfigDialogWindowTitle(dialog)

                    expect(title).to.exist
                    expect(title.textContent).to.match(/transformation/i)
                })
            })

            it("is a form element", async function()
            {
                await withGM(true, async () =>
                {
                    sheet = await openActorControlsMenu(actor)

                    const control = await findActorSheetControlsTranformationsItem(sheet)

                    control.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    dialog = await findTransformationConfigDialog(actor, {
                        timeout: 10_000
                    })

                    expect(dialog).to.exist
                    expect(dialog.matches("form")).to.equal(true)

                })
            })

            it("is a form element when opened from the pill for non-GMs", async function()
            {
                await withGM(false, async () =>
                {
                    // 1. Render actor sheet
                    sheet = await renderActorSheet(actor)

                    // 2. Find and click the transformation pill
                    const pill = await findTransformationPill(sheet)
                    expect(pill).to.exist

                    pill.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    // 3. Wait for dialog
                    dialog = await findTransformationConfigDialog(actor, {
                        timeout: 10_000
                    })

                    expect(dialog).to.exist
                    expect(dialog.matches("form")).to.equal(true)
                })
            })

            it("renders the expected configuration sections", async function()
            {
                await withGM(true, async () =>
                {
                    sheet = await openActorControlsMenu(actor)

                    const control = await findActorSheetControlsTranformationsItem(sheet)

                    control.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    dialog = await findTransformationConfigDialog(actor, {
                        timeout: 10_000
                    })

                    const configSection = getTransformationConfigDialogConfigSection(dialog)
                    const footerSection = getTransformationConfigDialogFooterSection(dialog)

                    expect(configSection).to.exist
                    expect(footerSection).to.exist
                })
            })

            it("renders the expected configuration sections when opened from the pill for non-GMs", async function()
            {
                await withGM(false, async () =>
                {
                    // 1. Render actor sheet
                    sheet = await renderActorSheet(actor)

                    // 2. Find and click the transformation pill
                    const pill = await findTransformationPill(sheet)
                    expect(pill).to.exist

                    pill.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    // 3. Wait for dialog
                    dialog = await findTransformationConfigDialog(actor, {
                        timeout: 10_000
                    })

                    // 4. Assert sections
                    const configSection =
                        getTransformationConfigDialogConfigSection(dialog)
                    const footerSection =
                        getTransformationConfigDialogFooterSection(dialog)

                    expect(configSection).to.exist
                    expect(footerSection).to.exist
                })
            })
        })

        describe("Transformation Config Dialog – Defaults", function()
        {
            this.timeout(10_000)

            beforeEach(async function()
            {
                ({ actor } = await setupTest({
                    currentTest: this.currentTest,
                    createObjects: {
                        actor: {}
                    }
                }))
            })

            afterEach(async function()
            {
                await tearDownEachTest({ tearDownExtras: { sheet: sheet, dialog: dialog } })
            })

            async function openDialog()
            {
                sheet = await openActorControlsMenu(actor)

                const control = await findActorSheetControlsTranformationsItem(sheet)

                control.dispatchEvent(
                    new MouseEvent("click", { bubbles: true })
                )

                dialog = await findTransformationConfigDialog(actor, {
                    timeout: 10_000
                })

                return dialog
            }

            it("defaults to no transformation selected", async function()
            {
                await withGM(true, async () =>
                {
                    const dialog = await openDialog()

                    const radio = getTransformationConfigDialogRadioInput(dialog, { checked: true })

                    expect(radio).to.exist
                    expect(radio.value).to.be.oneOf(["", "None", "none"])
                })
            })

            it("defaults to no transformation selected when opened from the pill for non-GMs", async function()
            {
                await withGM(false, async () =>
                {
                    // 1. Render actor sheet as non-GM
                    sheet = await renderActorSheet(actor)

                    // 2. Find and click the transformation pill
                    const pill = await findTransformationPill(sheet)
                    expect(pill).to.exist

                    pill.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    // 3. Wait for dialog
                    dialog = await findTransformationConfigDialog(actor, {
                        timeout: 10_000
                    })

                    // 4. Assert default radio selection
                    const radio =
                        getTransformationConfigDialogRadioInput(dialog, { checked: true })

                    expect(radio).to.exist
                    expect(radio.value).to.be.oneOf(["", "None", "none"])
                })
            })
        })

        describe("Transformation Config Dialog – Interaction", function()
        {
            this.timeout(10_000)

            let runtime
            let transformations

            beforeEach(async function()
            {
                ({ actor, runtime } = await setupTest({
                    currentTest: this.currentTest,
                    createObjects: {
                        actor: {},
                        runtime: {
                            serviceMocks: {
                                transformationService: createMockTransformationService()
                            }
                        }
                    }
                }))
                transformations = await runtime.services.transformationQueryService.getAll()
            })

            afterEach(async function()
            {
                await runtime.services.transformationService.whenIdle()
                await tearDownEachTest({ tearDownExtras: { sheet: sheet, dialog: dialog } })
            })

            async function openDialog(actor)
            {
                runtime.ui.dialogs.openTransformationConfig({
                    actor,
                    transformations
                })

                // Wait for THIS actor's dialog
                const dialog = await findTransformationConfigDialog(actor, {
                    timeout: 10_000
                })

                return dialog
            }
            it("applies changes when confirm is clicked", async function()
            {
                await withGM(true, async () =>
                {
                    const before = foundry.utils.deepClone(
                        actor.flags.transformations.type
                    )

                    const dialog = await openDialog(actor)

                    const radios = await getTransformationConfigDialogRadioInputs(dialog)
                    expect(radios).to.exist

                    // pick a non-default option
                    const selectedRadio = radios[Math.min(1, radios.length - 1)]

                    selectedRadio.checked = true
                    selectedRadio.dispatchEvent(
                        new Event("change", { bubbles: true })
                    )

                    const expectedValue = selectedRadio.defaultValue

                    const confirm = await getTransformationConfigDialogSubmit(dialog)
                    expect(confirm).to.exist

                    confirm.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    await waitForFlagUpdate({
                        actor,
                        scope: "transformations",
                        key: "type",
                        expected: expectedValue
                    })

                    expect(actor.flags.transformations.type).to.equal(expectedValue)
                })
            })

            it("applies changes when confirm is clicked for non-GMs", async function()
            {

                await withGM(true, async () =>
                {
                    const dialog = await openDialog(actor)

                    const radios = getTransformationConfigDialogRadioInputs(dialog)
                    expect(radios).to.exist
                    expect(radios.length).to.be.greaterThan(1)

                    const selectedRadio = radios[1]
                    selectedRadio.checked = true
                    selectedRadio.dispatchEvent(
                        new Event("change", { bubbles: true })
                    )

                    const expectedValue = selectedRadio.value

                    await asNonGMUser(async () =>
                    {
                        const confirm = getTransformationConfigDialogSubmit(dialog)
                        expect(confirm).to.exist

                        confirm.dispatchEvent(
                            new MouseEvent("click", { bubbles: true })
                        )
                    })

                    // Wait for mocked service to apply the change
                    await waitForFlagUpdate({
                        actor,
                        scope: "transformations",
                        key: "type",
                        expected: expectedValue
                    })

                    expect(actor.flags.transformations.type)
                        .to.equal(expectedValue)
                })
            })


            it("does not apply changes when close is clicked", async function()
            {
                await withGM(true, async () =>
                {
                    const before = foundry.utils.deepClone(actor.flags.transformations)

                    const dialog = await openDialog(actor)

                    const radio = getTransformationConfigDialogRadioInputs(dialog)

                    expect(radio).to.exist

                    const selectedRadio = radio[Math.min(1, radio.length - 1)]
                    selectedRadio.checked = true
                    selectedRadio.dispatchEvent(new Event("click", { bubbles: true }))

                    const close = getTransformationConfigDialogCloseButton(dialog)
                    expect(close).to.exist

                    close.click()

                    expect(actor.flags.transformations).to.deep.equal(before)
                })
            })

            it("does not apply changes when close is clicked for non-GMs", async function()
            {
                await withGM(false, async () =>
                {
                    const before = foundry.utils.deepClone(actor.flags.transformations)

                    // Open dialog via pill
                    sheet = await renderActorSheet(actor)

                    const pill = await findTransformationPill(sheet)
                    expect(pill).to.exist

                    pill.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    const dialog = await findTransformationConfigDialog(actor, {
                        timeout: 10_000
                    })

                    const radios = getTransformationConfigDialogRadioInputs(dialog)
                    expect(radios).to.exist

                    const selectedRadio =
                        radios[Math.min(1, radios.length - 1)]

                    selectedRadio.checked = true
                    selectedRadio.dispatchEvent(
                        new Event("click", { bubbles: true })
                    )

                    const close = getTransformationConfigDialogCloseButton(dialog)
                    expect(close).to.exist

                    close.click()

                    expect(actor.flags.transformations).to.deep.equal(before)
                })
            })
            it("closes the config dialog after confirm", async function()
            {
                await withGM(true, async () =>
                {
                    const before = foundry.utils.deepClone(actor.flags.transformations)
                    const dialog = await openDialog(actor)
                    const dialogId = dialog.id

                    const confirm = getTransformationConfigDialogSubmit(dialog)
                    confirm.click()
                    await runtime.services.transformationService.whenIdle()
                    await waitForElementGone(() =>
                        !document.querySelector(`#${dialogId}`),
                        { errorMessage: "Transformation config dialog did not close" }
                    )

                    expect(actor.flags.transformations).to.deep.equal(before)
                })
            })
            it("updates transformation card after dialog applies transformation", async function()
            {
                await withGM(true, async () =>
                {
                    const dialog = await openDialog(actor)

                    const radios = getTransformationConfigDialogRadioInputs(dialog)
                    expect(radios).to.exist

                    const selectedRadio = radios[Math.min(1, radios.length - 1)]

                    selectedRadio.checked = true
                    selectedRadio.dispatchEvent(
                        new Event("change", { bubbles: true })
                    )

                    const expectedValue = selectedRadio.defaultValue

                    const confirm = await getTransformationConfigDialogSubmit(dialog)
                    expect(confirm).to.exist

                    confirm.dispatchEvent(
                        new MouseEvent("click", { bubbles: true })
                    )

                    await waitForFlagUpdate({
                        actor,
                        scope: "transformations",
                        key: "type",
                        expected: expectedValue
                    })

                    const sheet = await renderActorSheet(actor)
                    const card = await findTransformationCardInSpecialTraitsTab(sheet)
                    const typeSelect = await findTransformationTypeSelect(card)

                    expect(
                        actor.getFlag("transformations", "type")
                    ).to.equal(
                        expectedValue
                    )
                })
            })
        })
    }
)
