import { cleanupQuenchTestActors } from "../helpers/cleanupActors.js"
import { createTestActor, createTestRuntime, readyGame, renderActorSheet, wait, withGM } from "../helpers/index.js"
import
{
    findTransformationPill,
    findAllTransformationPills,
    findTransformationGMAdministrationItem,
    queryTransformationGMAdministrationItem,
    findTransformationCardInSpecialTraitsTab,
    findEditModeSlider,
    findSpecialTraitsLink
} from "../selectors/actorSheet.finders.js"


quench.registerBatch(
    "transformations.ActorSheet",
    ({ describe, it, assert, expect }) =>
    {
        let actor
        let runtime = createTestRuntime()
        const existingActorIds = game.actors.map(actor => actor.id)
        async function setupTest(currentTest)
        {
            await readyGame()
            actor = await createTestActor({ name: currentTest.title })
        }

        async function tearDownTest()
        {

        }

        after(async function()
        {
            await wait(200)
            const existingIdSet = new Set(existingActorIds)

            const testActorIds = game.actors
                .filter(actor => !existingIdSet.has(actor.id))
                .map(actor => actor.id)

            await cleanupQuenchTestActors(testActorIds)
        })
        describe("ActorSheet - Render discipline", function()
        {
            this.timeout(10_000)
            let sheet

            beforeEach(async function()
            {
                await setupTest(this.currentTest)
            })

            afterEach(async function()
            {
                await tearDownTest()
            })
            it("does not mutate actor transformation data during render", async function()
            {
                const before = foundry.utils.deepClone(actor.flags.transformations)

                sheet = await renderActorSheet(actor)

                const after = actor.flags.transformations
                expect(after).to.deep.equal(before)
            })

        })
        describe("ActorSheet – Transformation Pill", function()
        {
            this.timeout(10_000)
            let sheet

            beforeEach(async function()
            {
                await setupTest(this.currentTest)
                sheet = await renderActorSheet(actor)
                await runtime.dependencies.utils.asyncTrackers
                    .get("ui")
                    .whenIdle()
            })

            afterEach(async function()
            {
                await tearDownTest()
            })

            it("renders the transformation pill on the actor sheet", async function()
            {
                const pill = await findTransformationPill(sheet)

                expect(pill).to.exist
            })

            it("does not duplicate the transformation pill on re-render", async function()
            {
                await renderActorSheet(actor)
                await renderActorSheet(actor)

                const pills = await findAllTransformationPills(sheet)
                expect(pills.length).to.equal(1)
            })

        })

        describe("ActorSheet – Transformation Control", function()
        {
            this.timeout(10_000)
            let sheet

            beforeEach(async function()
            {
                await setupTest(this.currentTest)
            })

            afterEach(async function()
            {
                await tearDownTest()
            })

            it("is visible to GMs regardless of transformation state", async function()
            {
                await withGM(true, async () =>
                {
                    sheet = await renderActorSheet(actor)
                    const control = await findTransformationGMAdministrationItem(sheet)
                    expect(control).to.exist
                })
            })

            it("is never visible to non-GMs", async function()
            {
                await withGM(false, async () =>
                {
                    sheet = await renderActorSheet(actor)
                    let found = null
                    try {
                        found = await findTransformationGMAdministrationItem(sheet)
                    }
                    catch (_) { }
                    expect(found).to.not.exist
                })
            })

            it("updates visibility when GM status changes between renders", async function()
            {
                await withGM(true, async () =>
                {
                    sheet = await renderActorSheet(actor)
                    const control = await findTransformationGMAdministrationItem(sheet)
                    expect(control).to.exist
                })

                await sheet.close()

                await withGM(false, async () =>
                {
                    await sheet.render(true)
                    const control = queryTransformationGMAdministrationItem(sheet)
                    expect(control).to.not.exist
                })
            })

            it("does not render a disabled transformation control for non-GMs", async function()
            {
                await withGM(false, async () =>
                {
                    sheet = await renderActorSheet(actor)
                    const control = queryTransformationGMAdministrationItem(sheet)
                    expect(control).to.not.exist
                })
            })

        })

        describe("ActorSheet - Transformation card", function()
        {
            this.timeout(10_000)
            let sheet

            beforeEach(async function()
            {
                await setupTest(this.currentTest)
            })

            afterEach(async function()
            {
                await tearDownTest()
            })

            it("renders the transformation card for GMs in the Special Traits tab", async function()
            {
                await withGM(true, async () =>
                {
                    const sheet = await renderActorSheet(actor)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)

                    expect(card).to.exist
                    expect(card.matches("fieldset.card.transformation-card")).to.equal(true)

                    // Legend / title
                    const legend = card.querySelector("legend")
                    expect(legend).to.exist
                    expect(legend.textContent)
                        .to.match(/transformation/i)

                    // GM-only controls (example: selects are enabled)
                    const selects = card.querySelectorAll("select")
                    expect(selects.length).to.be.greaterThan(0)

                    for (const select of selects) {
                        expect(select.disabled).to.equal(true)
                    }
                })
            })

            it("renders the transformation card for GMs in the Special Traits tab, edit mode", async function()
            {
                await withGM(true, async () =>
                {
                    const sheet = await renderActorSheet(actor)

                    const specialTraitsTabLink = await findSpecialTraitsLink(sheet)
                    specialTraitsTabLink.click()

                    const editModeButton = await findEditModeSlider(sheet)
                    expect(editModeButton).to.exists
                    editModeButton.click()

                    await sheet.render(true)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)

                    expect(card).to.exist
                    expect(card.matches("fieldset.card.transformation-card")).to.equal(true)

                    // Legend / title
                    const legend = card.querySelector("legend")
                    expect(legend).to.exist
                    expect(legend.textContent)
                        .to.match(/transformation/i)

                    // GM-only controls (example: selects are enabled)
                    const selects = card.querySelectorAll("select")
                    expect(selects.length).to.be.greaterThan(0)

                    for (const select of selects) {
                        expect(select.disabled).to.equal(false)
                    }
                })
            })

            it("renders the transformation card for non-GMs in the Special Traits tab", async function()
            {
                await withGM(false, async () =>
                {
                    const sheet = await renderActorSheet(actor)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)

                    expect(card).to.exist
                    expect(card.matches("fieldset.card.transformation-card")).to.equal(true)

                    // Legend / title
                    const legend = card.querySelector("legend")
                    expect(legend).to.exist
                    expect(legend.textContent)
                        .to.match(/transformation/i)

                    // GM-only controls (example: selects are enabled)
                    const selects = card.querySelectorAll("select")
                    expect(selects.length).to.be.greaterThan(0)

                    for (const select of selects) {
                        expect(select.disabled).to.equal(true)
                    }
                })
            })

            it("renders the transformation card for non-GMs in the Special Traits tab, edit mode", async function()
            {
                await withGM(false, async () =>
                {
                    const sheet = await renderActorSheet(actor)

                    const specialTraitsTabLink = await findSpecialTraitsLink(sheet)
                    specialTraitsTabLink.click()

                    const editModeButton = await findEditModeSlider(sheet)
                    expect(editModeButton).to.exists
                    editModeButton.click()

                    await sheet.render(true)

                    const card = await findTransformationCardInSpecialTraitsTab(sheet)

                    expect(card).to.exist
                    expect(card.matches("fieldset.card.transformation-card")).to.equal(true)

                    // Legend / title
                    const legend = card.querySelector("legend")
                    expect(legend).to.exist
                    expect(legend.textContent)
                        .to.match(/transformation/i)

                    // GM-only controls (example: selects are enabled)
                    const selects = card.querySelectorAll("select")
                    expect(selects.length).to.be.greaterThan(0)

                    for (const select of selects) {
                        expect(select.disabled).to.equal(true)
                    }
                })
            })
        })

    }
)