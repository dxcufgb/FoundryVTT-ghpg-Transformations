import { waitForFlagUpdate } from "../helpers/actors.js"
import { renderActorSheet, withGM } from "../helpers/index.js"
import { wait } from "../helpers/wait.js"
import { findEditModeSlider, findTransformationCardInSpecialTraitsTab } from "../selectors/actorSheet.finders.js"
import { findTransformationStageSelect, findTransformationTypeSelect } from "../selectors/transformationCardFinders.js"
import { setupTest, teardownAllTest, tearDownEachTest } from "../testLifecycle.js"

quench.registerBatch(
    "transformations.ActorSheet.TransformationCard - interactions",
    ({ describe, it, assert, expect }) =>
    {
        let actor
        let sheet
        let runtime
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

        describe("TransformationCard - Render", async function()
        {
            this.timeout(10_000)
            beforeEach(async function()
            {
                ({ actor, runtime } = await setupTest({
                    currentTest: this.currentTest,
                    createObjects: {
                        actor: {},
                        runtime: {}
                    }
                }))
            })

            afterEach(async function()
            {
                await tearDownEachTest({ tearDownExtras: { sheet: sheet } })
            })


            it("reflects existing transformation flags on render", async function()
            {
                await actor.setFlag("transformations", "type", "aberrant-horror")
                await actor.setFlag("transformations", "stage", 1)

                await runtime.services.transformationService.whenIdle()

                await withGM(true, async () =>
                {
                    const sheet = await renderActorSheet(actor)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)

                    const typeSelect = await findTransformationTypeSelect(card)
                    const stageSelect = await findTransformationStageSelect(card)

                    expect(
                        typeSelect.value
                    ).to.equal("Aberrant Horror")

                    expect(
                        stageSelect.value
                    ).to.equal("Stage 1")
                })
            })
        })
        describe("TransformationCard – interaction", async function()
        {
            this.timeout(10_000)
            beforeEach(async function()
            {
                ({ actor, runtime } = await setupTest({
                    currentTest: this.currentTest,
                    createObjects: {
                        actor: {},
                        runtime: {}
                    }
                }))
            })

            afterEach(async function()
            {
                await tearDownEachTest({ tearDownExtras: { sheet: sheet } })
            })

            it("renders disabled type and stage selects for GMs (edit mode is disabled)", async function()
            {
                await withGM(true, async () =>
                {
                    sheet = await renderActorSheet(actor)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)
                    expect(card).to.exist

                    const typeSelect = await findTransformationTypeSelect(card)
                    const stageSelect = await findTransformationStageSelect(card)

                    expect(typeSelect).to.exist
                    expect(typeSelect.disabled).to.equal(true)

                    expect(stageSelect).to.exist
                    expect(stageSelect.disabled).to.equal(true)
                })
            })

            it("renders editable type and stage selects for GMs", async function()
            {
                await withGM(true, async () =>
                {
                    sheet = await renderActorSheet(actor)

                    const editModeButton = await findEditModeSlider(sheet)
                    expect(editModeButton).to.exists
                    editModeButton.click()

                    await sheet.render(true)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)
                    expect(card).to.exist

                    const typeSelect = await findTransformationTypeSelect(card)
                    const stageSelect = await findTransformationStageSelect(card)

                    expect(typeSelect).to.exist
                    expect(typeSelect.disabled).to.equal(false)

                    expect(stageSelect).to.exist
                    expect(stageSelect.disabled).to.equal(false)
                })
            })

            it("updates transformation type when GM changes the type select", async function()
            {
                await withGM(true, async () =>
                {
                    sheet = await renderActorSheet(actor)

                    const editModeButton = await findEditModeSlider(sheet)
                    expect(editModeButton).to.exists
                    editModeButton.click()

                    await sheet.render(true)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)
                    const typeSelect = await findTransformationTypeSelect(card)

                    const before = null

                    typeSelect.value = typeSelect.options[1].value
                    typeSelect.dispatchEvent(
                        new Event("change", { bubbles: true })
                    )

                    await waitForFlagUpdate({
                        actor,
                        scope: "transformations",
                        key: "type",
                        expected: typeSelect.value
                    })

                    expect(
                        actor.getFlag("transformations", "type")
                    ).to.not.equal(before)
                })
            })

            it("updates transformation stage when GM changes the stage select", async function()
            {
                await withGM(true, async () =>
                {
                    sheet = await renderActorSheet(actor)

                    const editModeButton = await findEditModeSlider(sheet)
                    expect(editModeButton).to.exists
                    editModeButton.click()

                    await sheet.render(true)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)
                    const stageSelect = await findTransformationStageSelect(card)

                    stageSelect.value = stageSelect.options[1].value
                    stageSelect.dispatchEvent(
                        new Event("change", { bubbles: true })
                    )

                    await waitForFlagUpdate({
                        actor,
                        scope: "transformations",
                        key: "stage",
                        expected: Number(stageSelect.value)
                    })

                    expect(
                        actor.getFlag("transformations", "stage")
                    ).to.equal(Number(stageSelect.value))
                })
            })
            it("renders disabled type and stage selects for non-GMs (edit mode is disabled)", async function()
            {
                await withGM(false, async () =>
                {
                    sheet = await renderActorSheet(actor)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)
                    expect(card).to.exist

                    const typeSelect = await findTransformationTypeSelect(card)
                    const stageSelect = await findTransformationStageSelect(card)

                    expect(typeSelect).to.exist
                    expect(typeSelect.disabled).to.equal(true)

                    expect(stageSelect).to.exist
                    expect(stageSelect.disabled).to.equal(true)
                })
            })
            it("renders non-editable type and stage selects for non-GMs even though edit mode is active", async function()
            {
                await withGM(false, async () =>
                {
                    sheet = await renderActorSheet(actor)

                    const editModeButton = await findEditModeSlider(sheet)
                    expect(editModeButton).to.exists
                    editModeButton.click()

                    await sheet.render(true)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)
                    expect(card).to.exist

                    const typeSelect = await findTransformationTypeSelect(card)
                    const stageSelect = await findTransformationStageSelect(card)

                    expect(typeSelect).to.exist
                    expect(typeSelect.disabled).to.equal(true)

                    expect(stageSelect).to.exist
                    expect(stageSelect.disabled).to.equal(true)
                })
            })
        })

    }
)