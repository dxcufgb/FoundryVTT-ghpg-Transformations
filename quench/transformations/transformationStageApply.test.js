import { waitForActorConsistency } from "../helpers/actors.js"
import { expectAsyncWork } from "../helpers/async/expectAsyncWork.js"
import { createTestRuntime } from "../helpers/testRuntime.js"
import { wait } from "../helpers/wait.js"
import { findActiveChoiceDescription, findChoiceDialogDescriptionContainer, findChoiceDialogFooter, findChoiceDialogRadioButtons, findChoiceDialogRadioByUuid, findChoiceFooterButton, getChoiceDialogById } from "../selectors/choiceDialog.finders.js"
import { waitForElementGone, waitForNextFrame } from "../helpers/dom.js"
import { assertExpectedItems } from "../helpers/verifyStageItems.js"
import { advanceStageAndExpectChoiceDialog } from "../helpers/advanceStageAndExpectChoiceDialog.js"
import { advanceStageAndWait } from "../helpers/advanceStageAndWait.js"
import { advanceStageAndChoose } from "../helpers/adcanceStageAndExpectchoiceDialog.js"
import { getDependentChoice, getNonDependentChoice, getStageDef } from "../helpers/transformation.js"
import { waitForCondition } from "../helpers/waitForCondition.js"
import { setupTest, teardownAllTest, tearDownEachTest } from "../testLifecycle.js"
import { UiAccessor } from "../../bootstrap/uiAccessor.js"

quench.registerBatch(
    "transformations.applyStages",
    ({ describe, it, assert, expect }) =>
    {
        let actor
        let runtime = createTestRuntime()
        let transformationDef
        const existingActorIds = game.actors.map(actor => actor.id)
        async function localSetupTest(currentTest, transformationId)
        {
            ({ actor } = await setupTest({
                currentTest,
                createObjects: {
                    actor: {
                        name: currentTest.title + `(${transformationId})`, options: { race: "humanoid" }
                    }
                }
            }))
            transformationDef = await runtime.services.transformationQueryService.getDefinitionById(transformationId)
        }

        async function tearDownTest()
        {
            await tearDownEachTest()
        }

        after(async function()
        {
            await wait(200)
            const existingIdSet = new Set(existingActorIds)

            const testActorIds = game.actors
                .filter(actor => !existingIdSet.has(actor.id))
                .map(actor => actor.id)

            await teardownAllTest(testActorIds)
        })

        describe("Transformation Lifecycle – Stage 1 Application", function()
        {
            this.timeout(10_000)
            beforeEach(async function()
            {
                await localSetupTest(this.currentTest, "aberrant-horror")
            })

            afterEach(async function()
            {
                await tearDownTest()
            })

            it("applies no items, effects, or creature type when just adding transformation type", async function()
            {
                // --- act ---
                await expectAsyncWork(
                    () => runtime.services.transformationService.applyTransformation(
                        actor,
                        { definition: transformationDef }
                    ),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )

                // --- assert flags ---
                expect(
                    actor.getFlag("transformations", "type")
                ).to.equal(transformationDef.id)

                expect(
                    actor.getFlag("transformations", "stage")
                ).to.equal(0)

                const stage1 = Object.values(transformationDef.stages).find(s => s.stage === 1)
                expect(stage1).to.exist

                const raceItem = runtime.infrastructure.itemRepository.findEmbeddedByType(actor, "race")

                // --- actor grants ---
                if (stage1.grants?.actor?.creatureSubType) {
                    expect(
                        raceItem.system.type.subtype
                    ).to.not.equal(runtime.dependencies.utils.stringUtils.capitalize(stage1.grants.actor.creatureSubType))
                }

                // --- item grants ---
                const stage1GrantUuids = stage1.grants.items.map(g => g.uuid)

                for (const uuid of stage1GrantUuids) {
                    const exists = actor.items.some(i =>
                        i.flags?.transformations?.sourceUuid === uuid
                    )

                    expect(
                        exists,
                        `Item from stage 1 with UUID ${uuid} should NOT exist on actor`
                    ).to.equal(false)
                }

            })

            it("applies all stage 1 items, effects, and creature type", async function()
            {
                // --- act ---
                await expectAsyncWork(
                    () => runtime.services.transformationService.applyTransformation(
                        actor,
                        { definition: transformationDef }
                    ),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )

                await waitForNextFrame()

                expect(actor.getFlag("transformations", "stage")).to.be.equal(0)
                expect(actor.getFlag("transformations", "type")).to.be.equal("aberrant-horror")

                await advanceStageAndWait({
                    actor,
                    stage: 1,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                await runtime.dependencies.utils.asyncTrackers.whenIdle()

                await waitForCondition(() =>
                {
                    const raceItem = runtime.infrastructure.itemRepository.findEmbeddedByType(actor, "race")

                    return Boolean(raceItem?.system?.type?.subtype != "human")
                })

                // --- assert flags ---
                expect(
                    actor.getFlag("transformations", "type")
                ).to.equal(transformationDef.id)

                expect(
                    actor.getFlag("transformations", "stage")
                ).to.equal(1)

                const stage1 = Object.values(transformationDef.stages).find(s => s.stage === 1)
                expect(stage1).to.exist

                const raceItem = runtime.infrastructure.itemRepository.findEmbeddedByType(actor, "race")

                // --- actor grants ---
                if (stage1.grants?.actor?.creatureSubType) {
                    expect(
                        raceItem.system.type.subtype
                    ).to.equal(runtime.dependencies.utils.stringUtils.capitalize(stage1.grants.actor.creatureSubType))
                }

                // --- item grants ---
                const grantedItems = stage1.grants?.items ?? []
                assertExpectedItems({ expectedItems: grantedItems, actor, expect })
            })
        })
        describe("Transformation Lifecycle – Idempotency", function()
        {
            this.timeout(10_000)

            beforeEach(async function()
            {
                await localSetupTest(this.currentTest, "aberrant-horror")
            })

            afterEach(async function()
            {
                await tearDownTest()
            })

            it("does not duplicate grants when transformation applied twice", async function()
            {
                // 1️⃣ Apply transformation type (stage should be 0)
                await runtime.services.transformationService.applyTransformation(
                    actor,
                    { definition: transformationDef }
                )

                await waitForCondition(() =>
                    actor.getFlag("transformations", "stage") === 0
                )

                expect(
                    actor.getFlag("transformations", "stage")
                ).to.equal(0)

                // 2️⃣ Advance to stage 1
                await advanceStageAndWait({
                    actor,
                    stage: 1,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                await runtime.dependencies.utils.asyncTrackers.whenIdle()

                await waitForCondition(() =>
                {
                    const raceItem =
                        runtime.infrastructure.itemRepository.findEmbeddedByType(actor, "race")

                    return Boolean(raceItem?.system?.type?.subtype)
                })

                const itemCountAfterFirst = actor.items.size
                const effectCountAfterFirst = actor.effects.size

                // 3️⃣ Re-apply transformation type (should not duplicate stage 1 grants)
                await advanceStageAndWait({
                    actor,
                    stage: 1,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                await runtime.dependencies.utils.asyncTrackers.whenIdle()

                // 4️⃣ Assert nothing changed
                expect(actor.items.size).to.equal(itemCountAfterFirst)
                expect(actor.effects.size).to.equal(effectCountAfterFirst)

                expect(
                    actor.getFlag("transformations", "stage")
                ).to.equal(1)
            })
        })
        describe("Transformation Lifecycle – Effect Grants", function()
        {
            this.timeout(10_000)

            beforeEach(async function()
            {
                await localSetupTest(this.currentTest, "aberrant-horror")
            })

            afterEach(async function()
            {
                await tearDownTest()
            })

            it("creates all granted active effects for stage 1", async function()
            {
                await runtime.services.transformationService.applyTransformation(
                    actor,
                    { definition: transformationDef }
                )

                await runtime.dependencies.utils.asyncTrackers.whenIdle()

                const stage1 = Object.values(transformationDef.stages)
                    .find(s => s.stage === 1)

                const effects = stage1.grants?.effects ?? []

                for (const effect of effects) {
                    const found = actor.effects.find(
                        e => e.flags?.transformations?.sourceUuid === effect.uuid
                    )

                    expect(
                        found,
                        `Missing effect grant: ${effect.uuid}`
                    ).to.exist
                }
            })
        })
        describe("Transformation Lifecycle – Creature Type", function()
        {
            this.timeout(10_000)

            beforeEach(async function()
            {
                await localSetupTest(this.currentTest, "aberrant-horror")
            })

            afterEach(async function()
            {
                await tearDownTest()
            })

            it("applies creature subtype via the race item", async function()
            {
                await runtime.services.transformationService.applyTransformation(
                    actor,
                    { definition: transformationDef }
                )

                await advanceStageAndWait({
                    actor,
                    stage: 1,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                await runtime.dependencies.utils.asyncTrackers.whenIdle()

                await waitForCondition(() =>
                {
                    const raceItem =
                        runtime.infrastructure.itemRepository.findEmbeddedByType(actor, "race")

                    return Boolean(raceItem?.system?.type?.subtype != "human")
                })

                const stage1 = Object.values(transformationDef.stages)
                    .find(s => s.stage === 1)

                const raceItem = runtime.infrastructure.itemRepository.findEmbeddedByType(actor, "race")

                expect(raceItem).to.exist

                expect(raceItem.system.type.subtype)
                    .to.equal(runtime.dependencies.utils.stringUtils.capitalize(stage1.grants.actor.creatureSubType))
            })
        })
        describe("Transformation Lifecycle – Async Completion", function()
        {
            this.timeout(10_000)

            beforeEach(async function()
            {
                await localSetupTest(this.currentTest, "aberrant-horror")
            })

            afterEach(async function()
            {
                await tearDownTest()
            })

            it("leaves no pending async work after application", async function()
            {
                await expectAsyncWork(
                    () => runtime.services.transformationService.applyTransformation(
                        actor,
                        { definition: transformationDef }
                    ),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )
                await waitForActorConsistency(actor)
                await waitForNextFrame()

                const hasPending = runtime.dependencies.utils.asyncTrackers.getRunning().length

                expect(hasPending).to.equal(0)
            })
        })
        describe("Transformation Lifecycle – Stage up", function()
        {
            this.timeout(10_000)

            beforeEach(async function()
            {
                await localSetupTest(this.currentTest, "aberrant-horror")
                await expectAsyncWork(
                    () => runtime.services.transformationService.applyTransformation(
                        actor,
                        { definition: transformationDef }
                    ),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )

                await waitForActorConsistency(actor)
                await waitForNextFrame()
            })

            afterEach(async function()
            {
                await tearDownTest()
            })
            it("choice dialog is shown", async function()
            {
                // Act: attempt stage-up
                const dialog = await advanceStageAndExpectChoiceDialog({
                    actor,
                    stage: 2,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers,
                    errorMessage: "Stage 3 choice dialog did not open"
                })

                expect(dialog).to.exist
                expect(
                    dialog.classList.contains("transformation-choice-dialog")
                ).to.equal(true)
                dialog.remove()
            })

            it("renders all stage 2 choices with correct ids and labels", async function()
            {
                // Advance to stage 2 to trigger dialog
                const dialog = await advanceStageAndExpectChoiceDialog({
                    actor,
                    stage: 2,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers,
                    errorMessage: "Stage 3 choice dialog did not open"
                })
                await waitForNextFrame()
                expect(dialog).to.exist

                // --- expected choices from definition ---
                const stage2 = Object.values(transformationDef.stages).find(s => s.stage === 2)
                expect(stage2).to.exist
                expect(stage2.choices?.items?.length).to.be.greaterThan(0)

                const expectedChoices = stage2.choices.items

                // --- rendered radios ---
                const radios = await findChoiceDialogRadioButtons(dialog)

                expect(radios.length).to.equal(expectedChoices.length)

                for (const choice of expectedChoices) {
                    const radio = await findChoiceDialogRadioByUuid(dialog, choice.uuid)

                    expect(
                        radio,
                        `Missing radio for choice ${choice.uuid}`
                    ).to.exist

                    expect(Boolean(radio.checked)).to.equal(false)

                    const label = radio.closest("label") ?? radio.parentElement
                    expect(label.textContent)
                        .to.match(/.+/, "Choice label should not be empty")
                }
                dialog.remove()
            })

            it("keeps description hidden until a choice is selected", async function()
            {
                // Trigger dialog by advancing to stage 2
                const dialog = await advanceStageAndExpectChoiceDialog({
                    actor,
                    stage: 2,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers,
                    errorMessage: "Stage 3 choice dialog did not open"
                })
                await waitForNextFrame()
                expect(dialog).to.exist

                const choiceDescription = await findChoiceDialogDescriptionContainer(dialog)
                expect(choiceDescription).to.exist

                // 🔒 Initially disabled
                expect(choiceDescription.hasAttribute("hidden")).to.equal(true)

                const radios = await findChoiceDialogRadioButtons(dialog)
                expect(radios.length).to.be.greaterThan(0)

                // Select the first choice
                const radio = radios[0]
                await expectAsyncWork(
                    () => radio.click(),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )
                await waitForNextFrame()

                // ✅ Confirm should now be enabled
                expect(choiceDescription.hasAttribute("hidden")).to.equal(false)
                const activeDescription = await findActiveChoiceDescription(choiceDescription)

                // And should carry the selected id
                expect(activeDescription.dataset.choiceUuid)
                    .to.equal(radio.dataset.uuid)

                dialog.remove()
            })
            it("keeps confirm button hidden until a choice is selected", async function()
            {
                // Trigger dialog by advancing to stage 2
                const dialog = await advanceStageAndExpectChoiceDialog({
                    actor,
                    stage: 2,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers,
                    errorMessage: "Stage 3 choice dialog did not open"
                })
                expect(dialog).to.exist

                const choiceFooter = await findChoiceDialogFooter(dialog)
                expect(choiceFooter).to.exist

                // 🔒 Initially disabled
                expect(choiceFooter.hasAttribute("hidden")).to.equal(true)

                const radios = await findChoiceDialogRadioButtons(dialog)
                expect(radios.length).to.be.greaterThan(0)

                // Select the first choice
                const radio = radios[0]
                await expectAsyncWork(
                    () => radio.click(),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )
                await waitForNextFrame()

                // ✅ Confirm should now be enabled
                expect(choiceFooter.hasAttribute("hidden")).to.equal(false)
                const confirmButton = await findChoiceFooterButton(choiceFooter)

                // And should carry the selected id
                expect(confirmButton.dataset.id)
                    .to.equal(radio.dataset.id)

                dialog.remove()
            })

            it("resolves stage choice via dialog when stage with choices is entered", async function()
            {
                // Act: move actor to stage 2 (this triggers the resolver)
                const dialog = await advanceStageAndExpectChoiceDialog({
                    actor,
                    stage: 2,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers,
                    errorMessage: "Stage 3 choice dialog did not open"
                })
                await waitForNextFrame()
                expect(dialog).to.exist

                // Find radios
                const radios = await findChoiceDialogRadioButtons(dialog)
                expect(radios.length).to.be.greaterThan(0)

                // Select first choice
                const radio = radios[0]
                await expectAsyncWork(
                    () => radio.click(),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )
                await waitForNextFrame()

                const expectedId = radio.dataset.uuid
                expect(expectedId).to.exist

                // Confirm
                const confirm = dialog.querySelector(".choice-confirm")
                expect(confirm.disabled).to.equal(false)
                confirm.click()
                await waitForNextFrame()
                // Dialog closes
                await waitForElementGone(
                    () => document.getElementById(dialog.id),
                    { errorMessage: "Stage choice dialog did not close" }
                )
                await runtime.dependencies.utils.asyncTrackers.whenIdle()
                await waitForNextFrame()
                // Resolver should now have continued → stage flag remains 2
                expect(
                    actor.getFlag("transformations", "stage")
                ).to.equal(2)

                // Optional: verify choice was recorded if you store it
                const chosen = actor.getFlag("transformations", "stageChoices")?.[transformationDef.id]?.[2]
                expect(chosen).to.equal(expectedId)
            })

            it("aborts stage resolution when the stage choice dialog is closed without selecting", async function()
            {
                // --- act: advance to a stage that requires a choice ---
                const dialog = await advanceStageAndExpectChoiceDialog({
                    actor,
                    stage: 2,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers,
                    errorMessage: "Stage 3 choice dialog did not open"
                })
                expect(dialog).to.exist

                const radios = await findChoiceDialogRadioButtons(dialog)
                expect(radios.length).to.be.greaterThan(0)

                for (const radio of radios) {
                    expect(Boolean(radio.checked)).to.equal(false)
                }

                dialog.remove()

                await waitForElementGone(
                    () => document.getElementById(dialog.id),
                    { errorMessage: "Stage choice dialog did not close on cancel" }
                )

                await runtime.dependencies.utils.asyncTrackers.whenIdle()

                expect(
                    actor.getFlag("transformations", "stage"),
                    "Stage should remain at the triggering stage after cancel"
                ).to.equal(2)

                const chosen = actor.getFlag("transformations", "stageChoices", transformationDef.id, 2)
                expect(
                    chosen,
                    "No choice should be recorded when dialog is cancelled"
                ).to.not.exist
            })

            it("opens the stage 3 choice dialog when a stage 2 prerequisite choice was selected", async function()
            {
                await expectAsyncWork(
                    () => runtime.services.transformationService.applyTransformation(
                        actor,
                        { definition: transformationDef }
                    ),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )
                await waitForNextFrame()

                expect(actor.getFlag("transformations", "stage")).to.equal(0)

                const nextStage = getStageDef(transformationDef, 3, expect)

                const prerequisiteChoice = { uuid: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E" }
                const dependentChoice = getDependentChoice(
                    nextStage,
                    prerequisiteChoice.uuid,
                    expect
                )

                const chosen = await advanceStageAndChoose({
                    actor,
                    stage: 2,
                    choiceUuid: prerequisiteChoice.uuid,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                expect(chosen).to.equal(prerequisiteChoice.uuid)

                await runtime.dependencies.utils.asyncTrackers.whenIdle()

                const dialog = await advanceStageAndExpectChoiceDialog({
                    actor,
                    stage: 3,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                const dependentRadio = await findChoiceDialogRadioByUuid(
                    dialog,
                    dependentChoice.uuid
                )

                expect(dependentRadio).to.exist
                expect(Boolean(dependentRadio.disabled)).to.equal(false)

                dialog.remove()
            })

            it("do not open the stage 3 choice dialog when a stage 2 prerequisite choice was not selected", async function()
            {
                await expectAsyncWork(
                    () => runtime.services.transformationService.applyTransformation(
                        actor,
                        { definition: transformationDef }
                    ),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )
                await waitForNextFrame()

                expect(actor.getFlag("transformations", "stage")).to.equal(0)

                const nextStage = getStageDef(transformationDef, 3, expect)

                const nonPrerequisiteChoice = { uuid: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq" }

                const nonDependentChoice = getNonDependentChoice(nextStage, expect)

                const chosen = await advanceStageAndChoose({
                    actor,
                    stage: 2,
                    choiceUuid: nonPrerequisiteChoice.uuid,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                expect(chosen).to.equal(nonPrerequisiteChoice.uuid)

                await runtime.dependencies.utils.asyncTrackers.whenIdle()

                await advanceStageAndWait({
                    actor,
                    stage: 3,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                const stageDialog = getChoiceDialogById(actor, 3)

                expect(stageDialog).to.not.exist

                await waitForActorConsistency(actor)
                await waitForNextFrame()

                const stageChosen =
                    actor.getFlag("transformations", "stageChoices")
                    ?.[transformationDef.id]
                    ?.[3]

                expect(stageChosen).to.equal(nonDependentChoice.uuid)
            })

            it("shows the item info dialog when stage 3 auto-selects the only valid prerequisite choice", async function()
            {
                await expectAsyncWork(
                    () => runtime.services.transformationService.applyTransformation(
                        actor,
                        { definition: transformationDef }
                    ),
                    { trackers: runtime.dependencies.utils.asyncTrackers }
                )
                await waitForNextFrame()

                const nextStage = getStageDef(transformationDef, 3, expect)
                const prerequisiteChoice = {
                    uuid: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
                const autoSelectedChoice = getNonDependentChoice(nextStage, expect)

                const chosen = await advanceStageAndChoose({
                    actor,
                    stage: 2,
                    choiceUuid: prerequisiteChoice.uuid,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                expect(chosen).to.equal(prerequisiteChoice.uuid)

                const originalDialogs = UiAccessor.dialogs
                const originalAutoSelectInfoFlag =
                    globalThis.__TRANSFORMATIONS_SHOW_AUTOSELECT_ITEM_INFO__
                const infoDialogCalls = []

                UiAccessor.dialogs = {
                    ...originalDialogs,
                    async showItemInfoDialog(args)
                    {
                        infoDialogCalls.push(args)
                        return true
                    },
                    async openStageChoiceDialog()
                    {
                        throw new Error(
                            "Stage choice dialog should not open when only one valid choice exists"
                        )
                    }
                }
                globalThis.__TRANSFORMATIONS_SHOW_AUTOSELECT_ITEM_INFO__ = true

                try {
                    await advanceStageAndWait({
                        actor,
                        stage: 3,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })

                    await runtime.dependencies.utils.asyncTrackers.whenIdle()
                    await waitForNextFrame()
                } finally {
                    UiAccessor.dialogs = originalDialogs
                    globalThis.__TRANSFORMATIONS_SHOW_AUTOSELECT_ITEM_INFO__ =
                        originalAutoSelectInfoFlag
                }

                const stageDialog = getChoiceDialogById(actor, 3)
                expect(stageDialog).to.not.exist
                expect(infoDialogCalls).to.have.length(1)
                expect(infoDialogCalls[0]?.item?.uuid).to.equal(
                    autoSelectedChoice.uuid
                )

                const stageChosen =
                    actor.getFlag("transformations", "stageChoices")
                    ?.[transformationDef.id]
                    ?.[3]

                expect(stageChosen).to.equal(autoSelectedChoice.uuid)
            })

            it("replaces the specified item on the actor when stage 4 is applied", async function()
            {
                const originalUuid = "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz"
                const replacementUuid = "Compendium.transformations.gh-transformations.Item.bZIioCqc5wwEUdKG"

                const originalDoc = await fromUuid(originalUuid)
                expect(originalDoc, "Original compendium item not found").to.exist

                await runtime.infrastructure.itemRepository.addItemFromUuid({ actor, uuid: originalUuid })

                await waitForNextFrame()

                const originalItemOnActor = actor.items.find(i => i.name === originalDoc.name)
                expect(originalItemOnActor, "Original item not added to actor").to.exist

                await advanceStageAndWait({
                    actor,
                    stage: 4,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                await waitForCondition(() =>
                    !actor.items.some(i =>
                        i.flags?.transformations?.sourceUuid === originalUuid
                    )
                )

                await waitForCondition(() =>
                    actor.items.some(i =>
                        i.flags?.transformations?.sourceUuid === replacementUuid
                    )
                )
                await runtime.dependencies.utils.asyncTrackers.whenIdle()

                await waitForNextFrame()

                // --- assert ----------------------------------------------------------

                const stillHasOriginal = actor.items.some(i =>
                    i.flags?.transformations?.sourceUuid === originalUuid
                )
                expect(stillHasOriginal).to.equal(false)

                const hasReplacement = actor.items.some(i =>
                    i.flags?.transformations?.sourceUuid === replacementUuid
                )
                expect(hasReplacement).to.equal(true)
            })

            it("removes items awarded by the replaced item when stage 4 is applied", async function()
            {
                const originalUuid = "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz"
                const replacementUuid = "Compendium.transformations.gh-transformations.Item.bZIioCqc5wwEUdKG"
                const awardedUuid =
                    transformationDef?.stages?.[2]?.choices?.items?.[0]?.uuid

                expect(awardedUuid, "Awarded item UUID not found").to.be.a("string")

                const originalDoc = await fromUuid(originalUuid)
                const awardedDoc = await fromUuid(awardedUuid)

                expect(originalDoc, "Original compendium item not found").to.exist
                expect(awardedDoc, "Awarded compendium item not found").to.exist

                await runtime.infrastructure.itemRepository.addItemFromUuid({
                    actor,
                    uuid: originalUuid
                })

                await waitForNextFrame()

                const originalItemOnActor = actor.items.find(i =>
                    i.flags?.transformations?.sourceUuid === originalUuid
                )
                expect(originalItemOnActor, "Original item not added to actor").to.exist

                const awardedItem = await runtime.infrastructure.itemRepository.createObjectOnActor(
                    actor,
                    awardedDoc,
                    originalItemOnActor,
                    {
                        applyAdvancements: false
                    }
                )

                expect(awardedItem, "Awarded item not created").to.exist

                await waitForCondition(() =>
                    actor.items.some(i => i.id === awardedItem.id)
                )

                const awardedItemOnActor = actor.items.get(awardedItem.id)
                expect(awardedItemOnActor?.flags?.transformations?.awardedByItem)
                .to.equal(originalItemOnActor.uuid)

                await advanceStageAndWait({
                    actor,
                    stage: 4,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                await waitForCondition(() =>
                    !actor.items.some(i =>
                        i.flags?.transformations?.sourceUuid === originalUuid
                    )
                )

                await waitForCondition(() =>
                    actor.items.some(i =>
                        i.flags?.transformations?.sourceUuid === replacementUuid
                    )
                )

                await waitForCondition(() =>
                    !actor.items.some(i => i.id === awardedItem.id)
                )

                const hasAwardedItem = actor.items.some(i => i.id === awardedItem.id)
                expect(hasAwardedItem).to.equal(false)
            })

            it("opens the stage 4 choice dialog when actor has spell slots", async function()
            {

                // --- arrange ---------------------------------------------------------

                // Give actor spell slot capacity
                await actor.update({
                    "system.spells.spell1.override": 1,
                    "system.spells.spell1.value": 1
                })

                await waitForNextFrame()

                expect(runtime.infrastructure.actorRepository.hasAnySpellSlotCapacity(actor)).to.equal(true)

                // --- act -------------------------------------------------------------

                const dialog = await advanceStageAndExpectChoiceDialog({
                    actor,
                    stage: 4,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                expect(dialog).to.exist

                const radios = await findChoiceDialogRadioButtons(dialog)

                // Should have both choices
                expect(radios.length).to.equal(2)

                dialog.remove()
            })

            it("does not open stage 4 choice dialog when actor has no spell slots", async function()
            {
                //NEW
                await actor.update({
                    "system.spells.spell1.max": 0,
                    "system.spells.spell1.value": 0,
                    "system.spells.spell2.max": 0,
                    "system.spells.spell2.value": 0,
                    "system.spells.pact.max": 0,
                    "system.spells.pact.value": 0
                })

                expect(runtime.infrastructure.actorRepository.hasAnySpellSlotCapacity(actor)).to.equal(false)

                await advanceStageAndWait({
                    actor,
                    stage: 4,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                const dialog = getChoiceDialogById(actor, 4)

                expect(dialog).to.not.exist

                await waitForCondition(() =>
                    actor.getFlag("transformations", "stageChoices")?.[transformationDef.id]?.[4] === "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                )

                const stage4Chosen = actor.getFlag("transformations", "stageChoices")?.[transformationDef.id]?.[4]

                expect(stage4Chosen).to.equal(
                    "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                )
            })

        })
    }
)
