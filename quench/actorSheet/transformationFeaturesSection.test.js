import { renderActorSheet } from "../helpers/sheets.js"
import { wait } from "../helpers/wait.js"
import { waitFor } from "../helpers/waitFor.js"
import { setupTest, teardownAllTest, tearDownEachTest } from "../testLifecycle.js"
import
{
    addTransformationFeaturesSection,
    TRANSFORMATION_FEATURES_SECTION_ID
} from "../../infrastructure/sheets/registerTransformationFeaturesSection.js"

const SECTION_SELECTOR =
          `[data-tab="features"] .items-section[data-group-origin="${TRANSFORMATION_FEATURES_SECTION_ID}"]`

const PILL_SELECTOR = '[data-tab="features"] .transformation-features-pill'

function createFakeInventory()
{
    return {
        prepareSections(sections)
        {
            for (const section of sections) {
                section.items ??= []
                section.dataset = Object.fromEntries(
                    Object.entries(section.groups ?? {}).map(([key, value]) => [`group-${key}`, value])
                )
            }
            return sections
        }
    }
}

function createFakeContext({ granted, regular })
{
    const columns = [{ id: "uses" }]
    return {
        sections: [
            { id: "active", order: 100, columns, items: [...regular, ...granted] },
            { id: "other", order: 3000, columns, items: [] }
        ],
        itemContext: Object.fromEntries(
            [...regular, ...granted].map(item => [item.id, { groups: { origin: "other" }, dataset: {} }])
        )
    }
}

function fakeItem(id, addedByTransformation)
{
    return {
        id,
        name: id,
        flags: { transformations: addedByTransformation ? { addedByTransformation: true } : {} }
    }
}

const fakeLocalizer = {
    format: (key, data) => `${key}:${data.class}`
}

quench.registerBatch(
    "transformations.ActorSheet.TransformationFeaturesSection",
    ({ describe, it, expect }) =>
    {
        describe("addTransformationFeaturesSection", function()
        {
            const transformationTypes = { vampire: "Vampire" }

            it("moves only transformation-granted items into a new section", function()
            {
                const granted = [fakeItem("g1", true), fakeItem("g2", true)]
                const regular = [fakeItem("r1", false)]
                const context = createFakeContext({ granted, regular })

                const added = addTransformationFeaturesSection({
                    context,
                    actor: { flags: { transformations: { type: "vampire" } } },
                    transformationTypes,
                    Inventory: createFakeInventory(),
                    localizer: fakeLocalizer
                })

                expect(added).to.equal(true)
                const section = context.sections.find(s => s.id === TRANSFORMATION_FEATURES_SECTION_ID)
                expect(section.items.map(i => i.id)).to.deep.equal(["g1", "g2"])
                expect(section.label).to.equal("DND5E.FeaturesClass:Vampire")
                expect(section.dataset["group-origin"]).to.equal(TRANSFORMATION_FEATURES_SECTION_ID)
                expect(context.sections.find(s => s.id === "active").items.map(i => i.id)).to.deep.equal(["r1"])
                expect(context.itemContext.g1.dataset["group-origin"]).to.equal(TRANSFORMATION_FEATURES_SECTION_ID)
                expect(context.itemContext.g1.groups.origin).to.equal(TRANSFORMATION_FEATURES_SECTION_ID)
                expect(context.itemContext.r1.groups.origin).to.equal("other")
            })

            it("places the section between class and species/other sections", function()
            {
                const context = createFakeContext({ granted: [fakeItem("g1", true)], regular: [] })

                addTransformationFeaturesSection({
                    context,
                    actor: { flags: { transformations: { type: "vampire" } } },
                    transformationTypes,
                    Inventory: createFakeInventory(),
                    localizer: fakeLocalizer
                })

                expect(context.sections.map(s => s.id)).to.deep.equal(["active", TRANSFORMATION_FEATURES_SECTION_ID, "other"])
            })

            it("does nothing when no transformation is active", function()
            {
                const context = createFakeContext({ granted: [fakeItem("g1", true)], regular: [] })

                const added = addTransformationFeaturesSection({
                    context,
                    actor: { flags: {} },
                    transformationTypes,
                    Inventory: createFakeInventory(),
                    localizer: fakeLocalizer
                })

                expect(added).to.equal(false)
                expect(context.sections.some(s => s.id === TRANSFORMATION_FEATURES_SECTION_ID)).to.equal(false)
            })

            it("does nothing when no granted feature is present", function()
            {
                const context = createFakeContext({ granted: [], regular: [fakeItem("r1", false)] })

                const added = addTransformationFeaturesSection({
                    context,
                    actor: { flags: { transformations: { type: "vampire" } } },
                    transformationTypes,
                    Inventory: createFakeInventory(),
                    localizer: fakeLocalizer
                })

                expect(added).to.equal(false)
            })

            it("does not add the section twice", function()
            {
                const context = createFakeContext({ granted: [fakeItem("g1", true)], regular: [] })
                const args = {
                    context,
                    actor: { flags: { transformations: { type: "vampire" } } },
                    transformationTypes,
                    Inventory: createFakeInventory(),
                    localizer: fakeLocalizer
                }

                addTransformationFeaturesSection(args)
                const addedAgain = addTransformationFeaturesSection(args)

                expect(addedAgain).to.equal(false)
                expect(context.sections.filter(s => s.id === TRANSFORMATION_FEATURES_SECTION_ID).length).to.equal(1)
            })
        })

        describe("ActorSheet – Transformation features section", function()
        {
            this.timeout(15_000)
            let actor
            let sheet
            const existingActorIds = game.actors.map(a => a.id)

            after(async function()
            {
                await wait(200)
                const existingIdSet = new Set(existingActorIds)
                const testActorIds = game.actors
                    .filter(a => !existingIdSet.has(a.id))
                    .map(a => a.id)
                await teardownAllTest({ actorsToDeleteIds: testActorIds })
            })

            beforeEach(async function()
            {
                ({ actor } = await setupTest({
                    currentTest: this.currentTest,
                    createObjects: { actor: {} }
                }))
                await actor.createEmbeddedDocuments("Item", [
                    {
                        name: "Test Granted Feature",
                        type: "feat",
                        flags: { transformations: { addedByTransformation: true } }
                    },
                    { name: "Test Regular Feature", type: "feat" }
                ])
            })

            afterEach(async function()
            {
                await tearDownEachTest({ tearDownExtras: { sheet } })
            })

            async function renderFeaturesTab()
            {
                sheet = await renderActorSheet(actor)
                sheet.changeTab("features", "primary")
                return sheet
            }

            it("shows a section titled after the active transformation", async function()
            {
                await actor.update({ "flags.transformations.type": "vampire", "flags.transformations.stage": 1 })
                await renderFeaturesTab()

                const section = await waitFor({
                    predicate: () => sheet.element.querySelector(SECTION_SELECTOR),
                    errorMessage: "Transformation features section did not render"
                })

                expect(section.querySelector(".items-header .item-name").textContent.trim()).to.equal("Vampire Features")
                const names = [...section.querySelectorAll(".item-list > .item")].map(li => li.dataset.itemName)
                expect(names).to.deep.equal(["Test Granted Feature"])
            })

            it("keeps non-transformation features out of the section", async function()
            {
                await actor.update({ "flags.transformations.type": "vampire", "flags.transformations.stage": 1 })
                await renderFeaturesTab()

                const section = await waitFor({
                    predicate: () => sheet.element.querySelector(SECTION_SELECTOR),
                    errorMessage: "Transformation features section did not render"
                })

                expect(section.querySelector('[data-item-name="Test Regular Feature"]')).to.equal(null)
            })

            it("does not render the section without an active transformation", async function()
            {
                await renderFeaturesTab()
                await wait(300)

                expect(sheet.element.querySelector(SECTION_SELECTOR)).to.equal(null)
            })

            it("shows a read-only transformation pill directly after the class pills", async function()
            {
                await actor.update({ "flags.transformations.type": "vampire", "flags.transformations.stage": 2 })
                await renderFeaturesTab()

                const pill = await waitFor({
                    predicate: () => sheet.element.querySelector(PILL_SELECTOR),
                    errorMessage: "Transformation features pill did not render"
                })

                expect(pill.parentElement.previousElementSibling.matches("section.classes.pills-lg")).to.equal(true)
                expect(pill.querySelector(".title").textContent.trim()).to.equal("Vampire")
                expect(pill.querySelector(".level").textContent.trim()).to.equal("2")
                expect(pill.querySelectorAll(".controls, select, .item-control").length).to.equal(0)
            })

            it("does not duplicate the pill on re-render", async function()
            {
                await actor.update({ "flags.transformations.type": "vampire", "flags.transformations.stage": 1 })
                await renderFeaturesTab()
                await waitFor({
                    predicate: () => sheet.element.querySelector(PILL_SELECTOR),
                    errorMessage: "Transformation features pill did not render"
                })

                await sheet.render()
                await sheet.render()
                await wait(500)

                expect(sheet.element.querySelectorAll(PILL_SELECTOR).length).to.equal(1)
            })

            it("does not render the pill without an active transformation", async function()
            {
                await renderFeaturesTab()
                await wait(500)

                expect(sheet.element.querySelector(PILL_SELECTOR)).to.equal(null)
            })
        })
    }
)
