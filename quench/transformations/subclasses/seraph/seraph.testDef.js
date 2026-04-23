import { ATTRIBUTE } from "../../../../config/constants.js"
import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"

const CELESTIAL_FORM_UUID =
          "Compendium.transformations.gh-transformations.Item.lPVIY7UVSXBCdK5K"
const PLANAR_BINDING_UUID =
          "Compendium.transformations.gh-transformations.Item.ZdNOjtoY9BtunP6Q"
const ANGELIC_WINGS_UUID =
          "Compendium.transformations.gh-transformations.Item.0JNmGyBDqHalcz3W"
const HOLY_STRIKES_UUID =
          "Compendium.transformations.gh-transformations.Item.ybOElBsdS36JW9E4"
const BLINDING_RADIANCE_UUID =
          "Compendium.transformations.gh-transformations.Item.bZN7ITmrxwj3MmOI"
const SERAPH_STAGE_TWO_CHOICE_UUID =
          "Compendium.transformations.gh-transformations.Item.UH9aHsk5HHd7k7dS"
const DIVINE_CLEMENCY_UUID =
          "Compendium.transformations.gh-transformations.Item.bWIalvbrSuMrPvNT"
const SACRED_RETRIBUTION_UUID = SERAPH_STAGE_TWO_CHOICE_UUID
const HEALING_WORD_UUID =
          "Compendium.transformations.gh-transformations.Item.2nv0dM4U2yTrf0B5"
const BEACON_TO_DARKNESS_UUID =
          "Compendium.transformations.gh-transformations.Item.zFkviDvFLp8QiKJl"
const CLEANSE_AFFLICTION_UUID =
          "Compendium.transformations.gh-transformations.Item.Sz5sOHIQ1y9QWdRF"
const PROTECTIVE_WINGS_UUID =
          "Compendium.transformations.gh-transformations.Item.5MgmZYeNffq5C6f6"
const BOW_OF_CELESTIAL_JUDGEMENT_UUID =
          "Compendium.transformations.gh-transformations.Item.LlaGTb9Vq4r4Sx9V"
const BOW_OF_CELESTIAL_JUDGEMENT_ITEM_UUID =
          "Compendium.transformations.gh-transformations.Item.9RWqtVVjy7Yvvmgk"
const HIDING_CELESTIAL_FORM_EFFECT_NAME = "Hiding Celestial Form"

async function waitForSeraphStage1State({
    runtime,
    actor,
    waiters,
    choiceUuid
})
{
    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })

    await waiters.waitForCondition(() =>
    {
        const raceItem = actor.items.find(item => item.type === "race")

        return String(raceItem?.system?.type?.subtype ?? "").toLowerCase() ===
            "celestial" &&
            Array.from(actor.system?.traits?.dr?.value ?? []).includes("radiant") &&
            actor.system?.attributes?.death?.roll?.mode === -1 &&
            actor.items.some(item =>
                item.flags?.transformations?.sourceUuid === CELESTIAL_FORM_UUID
            ) &&
            actor.items.some(item =>
                item.flags?.transformations?.sourceUuid === PLANAR_BINDING_UUID
            ) &&
            actor.items.some(item =>
                item.flags?.transformations?.sourceUuid === choiceUuid
            )
    })
}

async function waitForSeraphStage2State({
    runtime,
    actor,
    waiters,
    choiceUuid
})
{
    await waitForSeraphStage1State({
        runtime,
        actor,
        waiters,
        choiceUuid: ANGELIC_WINGS_UUID
    })

    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })

    await waiters.waitForCondition(() =>
        actor.items.some(item =>
            item.flags?.transformations?.sourceUuid === BLINDING_RADIANCE_UUID
        ) &&
        actor.items.some(item =>
            item.flags?.transformations?.sourceUuid === choiceUuid
        )
    )
}

async function waitForSeraphStage3State({
    runtime,
    actor,
    waiters,
    stage1ChoiceUuid,
    stage2ChoiceUuid,
    stage3ChoiceUuid
})
{
    await waitForSeraphStage1State({
        runtime,
        actor,
        waiters,
        choiceUuid: stage1ChoiceUuid
    })

    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })

    await waiters.waitForCondition(() =>
        actor.items.some(item =>
            item.flags?.transformations?.sourceUuid === BLINDING_RADIANCE_UUID
        ) &&
        actor.items.some(item =>
            item.flags?.transformations?.sourceUuid === stage2ChoiceUuid
        ) &&
        actor.items.some(item =>
            item.flags?.transformations?.sourceUuid === BEACON_TO_DARKNESS_UUID
        ) &&
        actor.items.some(item =>
            item.flags?.transformations?.sourceUuid === stage3ChoiceUuid
        )
    )
}

function assertSeraphSubtype({actor, assert})
{
    const raceItem = actor.items.find(item => item.type === "race")

    assert.exists(raceItem, "Expected Seraph stage 1 to create a race item")
    assert.equal(
        String(raceItem.system?.type?.subtype ?? "").toLowerCase(),
        "celestial",
        "Expected Seraph stage 1 to set the race subtype to celestial"
    )
}

function addSeraphRaceItemAssertion(actorDto)
{
    actorDto.addItem(item =>
    {
        item.type = "race"
        item.systemType = "humanoid"
    })
}

function addCelestialFormItemAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [CELESTIAL_FORM_UUID]
        item.itemName = "Celestial Form"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "seraph"
        item.numberOfActivities = 0
        item.numberOfEffects = 1
        item.addEffect(effect =>
        {
            effect.name = "Celestial Form"
            effect.changes.count = 1
            effect.changes = [
                {
                    key: "system.traits.dr.value",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "radiant"
                }
            ]
        })
    })
}

function addPlanarBindingItemAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [PLANAR_BINDING_UUID]
        item.itemName = "Planar Binding"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "seraph"
        item.numberOfActivities = 0
        item.numberOfEffects = 1
        item.addEffect(effect =>
        {
            effect.name = "Planar Binding"
            effect.changes.count = 1
            effect.changes = [
                {
                    key: "system.attributes.death.roll.mode",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: -1
                }
            ]
        })
    })
}

function addAngelicWingsItemAssertions(actorDto, {
    usesMax = 2
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [ANGELIC_WINGS_UUID]
        item.itemName = "Angelic Wings"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "seraph"
        item.numberOfActivities = 1
        item.numberOfEffects = 1
        item.addActivity(activity =>
        {
            activity.name = "Manifest Wings"
            activity.activationType = "bonus"
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.uses.max = usesMax
            activity.uses.addRecovery(recovery =>
            {
                recovery.period = "lr"
                recovery.type = "recoverAll"
            })
            activity.uses.addRecovery(recovery =>
            {
                recovery.period = "sr"
                recovery.type = "recoverAll"
            })
            activity.addEffect(effect =>
            {
                effect.name = "Angelic Wings"
                effect.duration.seconds = 3600
                effect.changes.count = 2
                effect.changes = [
                    {
                        key: "system.attributes.movement.fly",
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: "@attributes.movement.walk"
                    },
                    {
                        key: "flags.transformations.seraph.angelicWings",
                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                        value: "1"
                    }
                ]
            })
        })
        item.addEffect(effect =>
        {
            effect.name = "Angelic Wings"
            effect.duration.seconds = 3600
            effect.changes.count = 2
            effect.changes = [
                {
                    key: "system.attributes.movement.fly",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "@attributes.movement.walk"
                },
                {
                    key: "flags.transformations.seraph.angelicWings",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "1"
                }
            ]
        })
    })
}

function addBlindingRadianceItemAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [BLINDING_RADIANCE_UUID]
        item.itemName = "Blinding Radiance"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "seraph"
        item.numberOfActivities = 4
        item.numberOfEffects = 3
        item.uses.max = "1"
        item.addActivity(activity =>
        {
            activity.name = "Hide Celestial Form"
            activity.activationType = "action"
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.target.prompt = false
            activity.addEffect(effect =>
            {
                effect.name = HIDING_CELESTIAL_FORM_EFFECT_NAME
            })
        })
        item.addActivity(activity =>
        {
            activity.name = "Blinding Light"
            activity.activationType = "special"
            activity.saveAbility = ["cha"]
            activity.saveDc = 15
            activity.range.units = "ft"
            activity.range.value = 30
            activity.target.affects.type = "creature"
            activity.target.affects.special = "Non-enemy creatures"
            activity.target.prompt = true
            activity.addEffect(effect =>
            {
                effect.name = "Blinding Radiance"
            })
        })
        item.addActivity(activity =>
        {
            activity.name = "Easy to hit"
            activity.activationType = "special"
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.target.prompt = false
            activity.addEffect(effect =>
            {
                effect.name = "Easy to hit"
            })
        })
        item.addEffect(effect =>
        {
            effect.name = HIDING_CELESTIAL_FORM_EFFECT_NAME
            effect.changes.count = 0
        })
        item.addEffect(effect =>
        {
            effect.name = "Blinding Radiance"
            effect.statuses = ["blinded"]
            effect.duration.seconds = 60
            effect.duration.turns = 10
            effect.changes.count = 0
        })
        item.addEffect(effect =>
        {
            effect.name = "Easy to hit"
            effect.duration.seconds = 60
            effect.duration.turns = 10
            effect.changes.count = 1
            effect.changes = [
                {
                    key: "flags.midi-qol.grants.advantage.attack.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "1",
                    priority: 20
                }
            ]
        })
    })
}

function addHolyStrikesItemAssertions(actorDto, {
    actorProf,
    stage
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [HOLY_STRIKES_UUID]
        item.itemName = "Holy Strikes"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "seraph"
        item.numberOfActivities = 1
        item.numberOfEffects = 0
        item.addActivity(activity =>
        {
            activity.activationType = "special"
            activity.range.units = "spec"
            activity.target.affects.type = "creature"
            activity.target.affects.count = "1"
            activity.uses.max = actorProf + stage
            activity.uses.addRecovery(recovery =>
            {
                recovery.period = "lr"
                recovery.type = "recoverAll"
            })
            activity.uses.addRecovery(recovery =>
            {
                recovery.period = "sr"
                recovery.type = "recoverAll"
            })
            activity.critical.allow = true
            activity.critical.bonus = ""
            activity.addDamagePart(damagePart =>
            {
                damagePart.customEnabled = true
                damagePart.custom = "(@flags.transformations.stage)d6"
                damagePart.bonus = ""
                damagePart.scalingNumber = 1
                damagePart.numberOfTypes = 1
                damagePart.damageTypes = ["radiant"]
            })
        })
    })
}

function addDivineClemencyItemAssertions(actorDto, {
    usesMax = 2
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [DIVINE_CLEMENCY_UUID]
        item.itemName = "Divine Clemency"
        item.type = "feat"
        item.numberOfActivities = 1
        item.numberOfEffects = 0
        item.addActivity(activity =>
        {
            activity.activationType = "reaction"
            activity.range.units = "self"
            activity.target.prompt = true
            activity.uses.max = usesMax
            activity.spellUuid = HEALING_WORD_UUID
        })
        item.addAdvancement(advancement =>
        {
            advancement.addConfiguration(configuration =>
            {
                configuration.items = [HEALING_WORD_UUID]
                configuration.spell.method = "spell"
                configuration.spell.prepared = 2
                configuration.spell.uses.max = ""
                configuration.spell.uses.per = ""
                configuration.spell.uses.requireSlot = true
            })
        })
    })
}

function addSacredRetributionItemAssertions(actorDto, {
    usesMax = 2
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [SACRED_RETRIBUTION_UUID]
        item.itemName = "Sacred Retribution"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "seraph"
        item.numberOfActivities = 1
        item.numberOfEffects = 0
        item.addActivity(activity =>
        {
            activity.name = "Holy Zeal"
            activity.activationType = "reaction"
            activity.range.units = "ft"
            activity.range.value = 30
            activity.target.affects.type = "ally"
            activity.target.affects.count = "1"
            activity.target.prompt = false
            activity.uses.max = usesMax
            activity.critical.allow = true
            activity.critical.bonus = ""
            activity.addDamagePart(damagePart =>
            {
                damagePart.roll = "1d8"
                damagePart.bonus = ""
                damagePart.scalingNumber = 1
                damagePart.numberOfTypes = 1
                damagePart.damageTypes = ["radiant"]
            })
        })
    })
}

function addBeaconToDarknessItemAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [BEACON_TO_DARKNESS_UUID]
        item.itemName = "Beacon to Darkness"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "seraph"
        item.numberOfActivities = 0
        item.numberOfEffects = 1
        item.addEffect(effect =>
        {
            effect.name = "Beacon to Darkness"
            effect.changes.count = 3
            effect.changes = [
                {
                    key: "flags.midi-qol.disadvantage.attack.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "1",
                    priority: 20
                },
                {
                    key: "flags.midi-qol.disadvantage.attack.save",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "1",
                    priority: 20
                },
                {
                    key: "flags.midi-qol.disadvantage.save.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "1",
                    priority: 20
                }
            ]
        })
    })
}

function addCleanseAfflictionItemAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [CLEANSE_AFFLICTION_UUID]
        item.itemName = "Cleanse Affliction"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "seraph"
        item.numberOfActivities = 0
        item.numberOfEffects = 1
        item.addEffect(effect =>
        {
            effect.name = "Roll Advantage"
            effect.changes.count = 1
            effect.changes = [
                {
                    key: "flags.midi-qol.advantage.all",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "1",
                    priority: 20
                }
            ]
            effect.flags.match.push({
                path: "dae",
                expected: {
                    specialDuration: [
                        "isSave",
                        "isCheck",
                        "isSkill",
                        "isInitiative",
                        "1Attack"
                    ]
                }
            })
        })
    })
}

function addProtectiveWingsItemAssertions(actorDto)
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [PROTECTIVE_WINGS_UUID]
        item.itemName = "Protective Wings"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "seraph"
        item.numberOfActivities = 0
        item.numberOfEffects = 1
        item.addEffect(effect =>
        {
            effect.name = "Protective Wings"
            effect.changes.count = 1
            effect.changes = [
                {
                    key: "system.attributes.movement.fly",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "10",
                    priority: 20
                }
            ]
            effect.flags.match.push({
                path: "dae",
                expected: {
                    disableCondition:
                        "@flags.transformations.seraph.angelicWings != 1"
                }
            })
        })
    })
}

function addBowOfCelestialJudgementItemAssertions(actorDto, {
    usesMax = 3
} = {})
{
    actorDto.addItem(item =>
    {
        item.expectedItemUuids = [BOW_OF_CELESTIAL_JUDGEMENT_UUID]
        item.itemName = "Bow of Celestial Judgement"
        item.type = "feat"
        item.systemType = "transformation"
        item.systemSubType = "seraph"
        item.numberOfActivities = 1
        item.numberOfEffects = 1
        item.addActivity(activity =>
        {
            activity.name = "Manifest Bow of Celestial Judgement"
            activity.activationType = "bonus"
            activity.range.units = "self"
            activity.target.affects.type = "self"
            activity.target.prompt = true
            activity.uses.max = usesMax
            activity.uses.addRecovery(recovery =>
            {
                recovery.period = "lr"
                recovery.type = "recoverAll"
            })
            activity.addEffect(effect =>
            {
                effect.name = "Bow of Celestial Judgement"
            })
        })
        item.addEffect(effect =>
        {
            effect.name = "Bow of Celestial Judgement"
            effect.duration.seconds = 60
            effect.duration.turns = 10
            effect.changes.count = 3
            effect.changes = [
                {
                    key: "macro.createItem",
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                    value: BOW_OF_CELESTIAL_JUDGEMENT_ITEM_UUID,
                    priority: 20
                },
                {
                    key: "system.traits.dr.value",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "necrotic",
                    priority: 20
                },
                {
                    key: "flags.transformations.seraph.bowManifested",
                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                    value: "1",
                    priority: 20
                }
            ]
        })
    })
}

function buildSeraphRequiredPath(stage)
{
    const path = [
        {
            stage: 1,
            choose: ANGELIC_WINGS_UUID
        }
    ]

    if (stage >= 2) {
        path.push({
            stage: 2,
            choose: SERAPH_STAGE_TWO_CHOICE_UUID
        })
    }

    return path
}

function getFirstActivity(item)
{
    const activities = item?.system?.activities
    if (!activities) return null

    if (Array.isArray(activities)) {
        return activities[0] ?? null
    }

    if (Array.isArray(activities.contents)) {
        return activities.contents[0] ?? null
    }

    if (typeof activities.values === "function") {
        return Array.from(activities.values())[0] ?? null
    }

    return Object.values(activities)[0] ?? null
}

function getBlindingRadianceItem(actor)
{
    return actor.items.find(item =>
        item.flags?.transformations?.sourceUuid === BLINDING_RADIANCE_UUID
    ) ?? null
}

function getAngelicWingsItem(actor)
{
    return actor.items.find(item =>
        item.flags?.transformations?.sourceUuid === ANGELIC_WINGS_UUID
    ) ?? null
}

async function createHidingCelestialFormEffect(actor)
{
    if (actor.effects.some(effect =>
        effect.name === HIDING_CELESTIAL_FORM_EFFECT_NAME
    ))
    {
        return
    }

    await actor.createEmbeddedDocuments("ActiveEffect", [
        {
            name: HIDING_CELESTIAL_FORM_EFFECT_NAME,
            disabled: false
        }
    ])
}

async function configureBlindingRadianceUses(actor, {
    max,
    spent
})
{
    const item = getBlindingRadianceItem(actor)

    if (!item) {
        throw new Error("Blinding Radiance item not present on actor")
    }

    await item.update({
        "system.uses.max": max,
        "system.uses.spent": spent
    })

    return item
}

async function waitForHidingCelestialFormState({
    actor,
    runtime,
    waiters,
    present
})
{
    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })

    await waiters.waitForCondition(() =>
        actor.effects.some(effect =>
            effect.name === HIDING_CELESTIAL_FORM_EFFECT_NAME
        ) === present
    )
}

function assertHidingCelestialFormState({
    actor,
    assert,
    present
})
{
    const actorDto = new ActorValidationDTO(actor)

    if (present) {
        actorDto.effects.has.push(HIDING_CELESTIAL_FORM_EFFECT_NAME)
    } else {
        actorDto.effects.notHas.push(HIDING_CELESTIAL_FORM_EFFECT_NAME)
    }

    validate(actorDto, {assert})
}

async function triggerAngelicWingsActivityUse({
    actor,
    runtime
})
{
    const angelicWings = getAngelicWingsItem(actor)
    if (!angelicWings) {
        throw new Error("Angelic Wings item not present on actor")
    }

    const activity = getFirstActivity(angelicWings)

    await runtime.services.triggerRuntime.run("activityUse", actor, {
        activities: {
            current: {
                activity: {
                    id: activity?._id ?? activity?.id ?? null,
                    name: activity?.name ?? "",
                    type: activity?.type ?? ""
                },
                item: {
                    id: angelicWings.id,
                    name: angelicWings.name,
                    uuid: angelicWings.uuid,
                    sourceUuid:
                        angelicWings.flags?.transformations?.sourceUuid ?? null,
                    type: angelicWings.type,
                    systemType: angelicWings.system?.type?.value ?? "",
                    systemSubType: angelicWings.system?.type?.subtype ?? ""
                }
            }
        }
    })
}

const blindingRadianceTriggerCases = [
    {
        name: "Blinding Radiance saving throw success on bloodied",
        trigger: "bloodied",
        saveResult: 13,
        expectHiddenEffect: true
    },
    {
        name: "Blinding Radiance saving throw fail on bloodied",
        trigger: "bloodied",
        saveResult: 12,
        expectHiddenEffect: false
    },
    {
        name: "Blinding Radiance saving throw success on unconscious",
        trigger: "unconscious",
        saveResult: 13,
        expectHiddenEffect: true
    },
    {
        name: "Blinding Radiance saving throw fail on unconscious",
        trigger: "unconscious",
        saveResult: 12,
        expectHiddenEffect: false
    }
].map(testCase => ({
    name: testCase.name,
    uuid: BLINDING_RADIANCE_UUID,
    requiredPath: buildSeraphRequiredPath(2),
    setup: async () =>
    {
        globalThis.___TransformationTestEnvironment___.saveResult = testCase.saveResult
        globalThis.___TransformationTestEnvironment___.saveRolled = false
    },
    steps: [
        async ({actor}) =>
        {
            await createHidingCelestialFormEffect(actor)
        }
    ],
    trigger: testCase.trigger,
    await: async ({actor, runtime, waiters}) =>
    {
        await waitForHidingCelestialFormState({
            actor,
            runtime,
            waiters,
            present: testCase.expectHiddenEffect
        })
    },
    assertions: async ({actor, assert}) =>
    {
        assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)
        assertHidingCelestialFormState({
            actor,
            assert,
            present: testCase.expectHiddenEffect
        })
    }
}))

const blindingRadianceActivityUseCases = [
    {
        name: "Blinding Radiance saving throw success on seraph transformation activity use",
        saveResult: 13,
        expectHiddenEffect: true
    },
    {
        name: "Blinding Radiance saving throw fail on seraph transformation activity use",
        saveResult: 12,
        expectHiddenEffect: false
    }
].map(testCase => ({
    name: testCase.name,
    uuid: BLINDING_RADIANCE_UUID,
    requiredPath: buildSeraphRequiredPath(2),
    setup: async () =>
    {
        globalThis.___TransformationTestEnvironment___.saveResult = testCase.saveResult
        globalThis.___TransformationTestEnvironment___.saveRolled = false
    },
    steps: [
        async ({actor}) =>
        {
            await createHidingCelestialFormEffect(actor)
            await configureBlindingRadianceUses(actor, {
                max: 1,
                spent: 0
            })
        },
        async ({actor, runtime}) =>
        {
            await triggerAngelicWingsActivityUse({
                actor,
                runtime
            })
        }
    ],
    await: async ({actor, runtime, waiters}) =>
    {
        await waitForHidingCelestialFormState({
            actor,
            runtime,
            waiters,
            present: testCase.expectHiddenEffect
        })
    },
    assertions: async ({actor, assert}) =>
    {
        const item = getBlindingRadianceItem(actor)

        assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)
        assert.strictEqual(Number(item?.system?.uses?.spent ?? 0), 1)
        assertHidingCelestialFormState({
            actor,
            assert,
            present: testCase.expectHiddenEffect
        })
    }
}))

const blindingRadianceNonTriggerCases = [
    {
        name: "Blinding Radiance does not trigger on seraph activity use without remaining uses",
        steps: [
            async ({actor}) =>
            {
                await createHidingCelestialFormEffect(actor)
                await configureBlindingRadianceUses(actor, {
                    max: 1,
                    spent: 1
                })
            },
            async ({actor, runtime}) =>
            {
                await triggerAngelicWingsActivityUse({
                    actor,
                    runtime
                })
            }
        ],
        expectSaveRolled: false,
        expectedSpent: 1,
        expectHiddenEffect: true
    },
    {
        name: "Blinding Radiance does not trigger on non-seraph transformation activity use",
        steps: [
            async ({actor}) =>
            {
                await createHidingCelestialFormEffect(actor)
                await configureBlindingRadianceUses(actor, {
                    max: 1,
                    spent: 0
                })
            },
            async ({actor, runtime}) =>
            {
                await runtime.services.triggerRuntime.run("activityUse", actor, {
                    activities: {
                        current: {
                            activity: {
                                id: "fake-activity",
                                name: "Fake Activity",
                                type: "utility"
                            },
                            item: {
                                id: "fake-item",
                                name: "Fake Transformation",
                                uuid: "fake-uuid",
                                sourceUuid: "fake-source",
                                type: "feat",
                                systemType: "transformation",
                                systemSubType: "ooze"
                            }
                        }
                    }
                })
            }
        ],
        expectSaveRolled: false,
        expectedSpent: 0,
        expectHiddenEffect: true
    }
].map(testCase => ({
    name: testCase.name,
    uuid: BLINDING_RADIANCE_UUID,
    requiredPath: buildSeraphRequiredPath(2),
    setup: async () =>
    {
        globalThis.___TransformationTestEnvironment___.saveRolled = false
    },
    steps: testCase.steps,
    await: async ({actor, runtime, waiters}) =>
    {
        await waitForHidingCelestialFormState({
            actor,
            runtime,
            waiters,
            present: testCase.expectHiddenEffect
        })
    },
    assertions: async ({actor, assert}) =>
    {
        const item = getBlindingRadianceItem(actor)

        assert.strictEqual(
            globalThis.___TransformationTestEnvironment___.saveRolled,
            testCase.expectSaveRolled
        )
        assert.strictEqual(
            Number(item?.system?.uses?.spent ?? 0),
            testCase.expectedSpent
        )
        assertHidingCelestialFormState({
            actor,
            assert,
            present: testCase.expectHiddenEffect
        })
    }
}))

const blindingRadianceSavingThrowCases = [
    {
        name: "Blinding Radiance does not trigger on savingThrow runtime event",
        steps: [
            async ({actor}) =>
            {
                await createHidingCelestialFormEffect(actor)
            },
            async ({actor, runtime}) =>
            {
                await runtime.services.triggerRuntime.run("savingThrow", actor, {
                    saves: {
                        current: {
                            ability: "wis",
                            isSpell: true,
                            naturalRoll: 1,
                            total: 1,
                            success: false
                        }
                    }
                })
            }
        ],
        expectSaveRolled: false
    }
].map(testCase => ({
    name: testCase.name,
    uuid: BLINDING_RADIANCE_UUID,
    requiredPath: buildSeraphRequiredPath(2),
    setup: async () =>
    {
        globalThis.___TransformationTestEnvironment___.saveRolled = false
    },
    steps: testCase.steps,
    await: async ({actor, runtime, waiters}) =>
    {
        await waitForHidingCelestialFormState({
            actor,
            runtime,
            waiters,
            present: true
        })
    },
    assertions: async ({actor, assert}) =>
    {
        assert.strictEqual(
            globalThis.___TransformationTestEnvironment___.saveRolled,
            testCase.expectSaveRolled
        )
        assertHidingCelestialFormState({
            actor,
            assert,
            present: true
        })
    }
}))

export const seraphTestDef = {
    id: "seraph",
    name: "Seraph",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: "stage 1 with Angelic Wings",
            steps: [
                {
                    stage: 1,
                    choose: ANGELIC_WINGS_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                }
            ],
            finalAwait: async ({runtime, actor, waiters}) =>
            {
                await waitForSeraphStage1State({
                    runtime,
                    actor,
                    waiters,
                    choiceUuid: ANGELIC_WINGS_UUID
                })
            },
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                actorDto.hasItemWithSourceUuids = [
                    CELESTIAL_FORM_UUID,
                    PLANAR_BINDING_UUID,
                    ANGELIC_WINGS_UUID
                ]
                actorDto.stats.resistances = ["radiant"]
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })

                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [CELESTIAL_FORM_UUID]
                    item.itemName = "Celestial Form"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "seraph"
                    item.numberOfActivities = 0
                    item.numberOfEffects = 1
                    item.addEffect(effect =>
                    {
                        effect.name = "Celestial Form"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.traits.dr.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "radiant"
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [PLANAR_BINDING_UUID]
                    item.itemName = "Planar Binding"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "seraph"
                    item.numberOfActivities = 0
                    item.numberOfEffects = 1
                    item.addEffect(effect =>
                    {
                        effect.name = "Planar Binding"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.attributes.death.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: -1
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [ANGELIC_WINGS_UUID]
                    item.itemName = "Angelic Wings"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "seraph"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 1
                    item.addActivity(activity =>
                    {
                        activity.name = "Manifest Wings"
                        activity.activationType = "bonus"
                        activity.range.units = "self"
                        activity.target.affects.type = "self"
                        activity.uses.max = 1
                        activity.uses.addRecovery(recovery =>
                        {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.uses.addRecovery(recovery =>
                        {
                            recovery.period = "sr"
                            recovery.type = "recoverAll"
                        })
                        activity.addEffect(effect =>
                        {
                            effect.name = "Angelic Wings"
                            effect.duration.seconds = 3600
                            effect.changes.count = 2
                            effect.changes = [
                                {
                                    key: "system.attributes.movement.fly",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: "@attributes.movement.walk"
                                },
                                {
                                    key: "flags.transformations.seraph.angelicWings",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: "1"
                                }
                            ]
                        })
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Angelic Wings"
                        effect.duration.seconds = 3600
                        effect.changes.count = 2
                        effect.changes = [
                            {
                                key: "system.attributes.movement.fly",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "@attributes.movement.walk"
                            },
                            {
                                key: "flags.transformations.seraph.angelicWings",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "1"
                            }
                        ]
                    })
                })

                validate(actorDto, {assert})
                assertSeraphSubtype({actor, assert})
            }
        },
        {
            name: "stage 1 with Holy Strikes",
            steps: [
                {
                    stage: 1,
                    choose: HOLY_STRIKES_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                }
            ],
            finalAwait: async ({runtime, actor, waiters}) =>
            {
                await waitForSeraphStage1State({
                    runtime,
                    actor,
                    waiters,
                    choiceUuid: HOLY_STRIKES_UUID
                })
            },
            finalAssertions: async ({actor, assert}) =>
            {
                const actorProf = actor.system.attributes.prof
                const actorDto = new ActorValidationDTO(actor)

                actorDto.hasItemWithSourceUuids = [
                    CELESTIAL_FORM_UUID,
                    PLANAR_BINDING_UUID,
                    HOLY_STRIKES_UUID
                ]
                actorDto.stats.resistances = ["radiant"]
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })

                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [HOLY_STRIKES_UUID]
                    item.itemName = "Holy Strikes"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "seraph"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 0
                    item.addActivity(activity =>
                    {
                        activity.activationType = "special"
                        activity.range.units = "spec"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = "1"
                        activity.uses.max = actorProf + 1
                        activity.uses.addRecovery(recovery =>
                        {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.uses.addRecovery(recovery =>
                        {
                            recovery.period = "sr"
                            recovery.type = "recoverAll"
                        })
                        activity.critical.allow = true
                        activity.critical.bonus = ""
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.customEnabled = true
                            damagePart.custom = "(@flags.transformations.stage)d6"
                            damagePart.bonus = ""
                            damagePart.scalingNumber = 1
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["radiant"]
                        })
                    })
                })

                validate(actorDto, {assert})
                assertSeraphSubtype({actor, assert})
            }
        },
        {
            name: "stage 2 with Divine Clemency",
            steps: [
                {
                    stage: 1,
                    choose: ANGELIC_WINGS_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                },
                {
                    stage: 2,
                    choose: DIVINE_CLEMENCY_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            2
                        )
                    }
                }
            ],
            finalAwait: async ({runtime, actor, waiters}) =>
            {
                await waitForSeraphStage2State({
                    runtime,
                    actor,
                    waiters,
                    choiceUuid: DIVINE_CLEMENCY_UUID
                })
            },
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                actorDto.hasItemWithSourceUuids = [
                    CELESTIAL_FORM_UUID,
                    PLANAR_BINDING_UUID,
                    ANGELIC_WINGS_UUID,
                    BLINDING_RADIANCE_UUID,
                    DIVINE_CLEMENCY_UUID
                ]
                actorDto.stats.resistances = ["radiant"]
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })

                addSeraphRaceItemAssertion(actorDto)
                addCelestialFormItemAssertions(actorDto)
                addPlanarBindingItemAssertions(actorDto)
                addAngelicWingsItemAssertions(actorDto, {
                    usesMax: 2
                })
                addBlindingRadianceItemAssertions(actorDto)
                addDivineClemencyItemAssertions(actorDto, {
                    usesMax: 2
                })

                validate(actorDto, {assert})
                assertSeraphSubtype({actor, assert})
            }
        },
        {
            name: "stage 2 with Sacred Retribution",
            steps: [
                {
                    stage: 1,
                    choose: ANGELIC_WINGS_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                },
                {
                    stage: 2,
                    choose: SACRED_RETRIBUTION_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            2
                        )
                    }
                }
            ],
            finalAwait: async ({runtime, actor, waiters}) =>
            {
                await waitForSeraphStage2State({
                    runtime,
                    actor,
                    waiters,
                    choiceUuid: SACRED_RETRIBUTION_UUID
                })
            },
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                actorDto.hasItemWithSourceUuids = [
                    CELESTIAL_FORM_UUID,
                    PLANAR_BINDING_UUID,
                    ANGELIC_WINGS_UUID,
                    BLINDING_RADIANCE_UUID,
                    SACRED_RETRIBUTION_UUID
                ]
                actorDto.stats.resistances = ["radiant"]
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })

                addSeraphRaceItemAssertion(actorDto)
                addCelestialFormItemAssertions(actorDto)
                addPlanarBindingItemAssertions(actorDto)
                addAngelicWingsItemAssertions(actorDto, {
                    usesMax: 2
                })
                addBlindingRadianceItemAssertions(actorDto)
                addSacredRetributionItemAssertions(actorDto, {
                    usesMax: 2
                })

                validate(actorDto, {assert})
                assertSeraphSubtype({actor, assert})
            }
        },
        {
            name: "stage 3 with Cleanse Affliction",
            steps: [
                {
                    stage: 1,
                    choose: HOLY_STRIKES_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                },
                {
                    stage: 2,
                    choose: DIVINE_CLEMENCY_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            2
                        )
                    }
                },
                {
                    stage: 3,
                    choose: CLEANSE_AFFLICTION_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            3
                        )
                    }
                }
            ],
            finalAwait: async ({runtime, actor, waiters}) =>
            {
                await waitForSeraphStage3State({
                    runtime,
                    actor,
                    waiters,
                    stage1ChoiceUuid: HOLY_STRIKES_UUID,
                    stage2ChoiceUuid: DIVINE_CLEMENCY_UUID,
                    stage3ChoiceUuid: CLEANSE_AFFLICTION_UUID
                })
            },
            finalAssertions: async ({actor, assert}) =>
            {
                const actorProf = actor.system.attributes.prof
                const actorDto = new ActorValidationDTO(actor)

                actorDto.hasItemWithSourceUuids = [
                    CELESTIAL_FORM_UUID,
                    PLANAR_BINDING_UUID,
                    HOLY_STRIKES_UUID,
                    BLINDING_RADIANCE_UUID,
                    DIVINE_CLEMENCY_UUID,
                    BEACON_TO_DARKNESS_UUID,
                    CLEANSE_AFFLICTION_UUID
                ]
                actorDto.stats.resistances = ["radiant"]
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })

                addSeraphRaceItemAssertion(actorDto)
                addCelestialFormItemAssertions(actorDto)
                addPlanarBindingItemAssertions(actorDto)
                addHolyStrikesItemAssertions(actorDto, {
                    actorProf,
                    stage: 3
                })
                addBlindingRadianceItemAssertions(actorDto)
                addDivineClemencyItemAssertions(actorDto, {
                    usesMax: 3
                })
                addBeaconToDarknessItemAssertions(actorDto)
                addCleanseAfflictionItemAssertions(actorDto)

                validate(actorDto, {assert})
                assertSeraphSubtype({actor, assert})
            }
        },
        {
            name: "stage 3 with Protective Wings",
            steps: [
                {
                    stage: 1,
                    choose: ANGELIC_WINGS_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                },
                {
                    stage: 2,
                    choose: SACRED_RETRIBUTION_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            2
                        )
                    }
                },
                {
                    stage: 3,
                    choose: PROTECTIVE_WINGS_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            3
                        )
                    }
                }
            ],
            finalAwait: async ({runtime, actor, waiters}) =>
            {
                await waitForSeraphStage3State({
                    runtime,
                    actor,
                    waiters,
                    stage1ChoiceUuid: ANGELIC_WINGS_UUID,
                    stage2ChoiceUuid: SACRED_RETRIBUTION_UUID,
                    stage3ChoiceUuid: PROTECTIVE_WINGS_UUID
                })
            },
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)

                actorDto.hasItemWithSourceUuids = [
                    CELESTIAL_FORM_UUID,
                    PLANAR_BINDING_UUID,
                    ANGELIC_WINGS_UUID,
                    BLINDING_RADIANCE_UUID,
                    SACRED_RETRIBUTION_UUID,
                    BEACON_TO_DARKNESS_UUID,
                    PROTECTIVE_WINGS_UUID
                ]
                actorDto.stats.resistances = ["radiant"]
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })

                addSeraphRaceItemAssertion(actorDto)
                addCelestialFormItemAssertions(actorDto)
                addPlanarBindingItemAssertions(actorDto)
                addAngelicWingsItemAssertions(actorDto, {
                    usesMax: 3
                })
                addBlindingRadianceItemAssertions(actorDto)
                addSacredRetributionItemAssertions(actorDto, {
                    usesMax: 3
                })
                addBeaconToDarknessItemAssertions(actorDto)
                addProtectiveWingsItemAssertions(actorDto)

                validate(actorDto, {assert})
                assertSeraphSubtype({actor, assert})
            }
        },
        {
            name: "stage 3 with Bow of Celestial Judgement",
            steps: [
                {
                    stage: 1,
                    choose: HOLY_STRIKES_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                },
                {
                    stage: 2,
                    choose: SACRED_RETRIBUTION_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            2
                        )
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            3
                        )
                    }
                }
            ],
            finalAwait: async ({runtime, actor, waiters}) =>
            {
                await waitForSeraphStage3State({
                    runtime,
                    actor,
                    waiters,
                    stage1ChoiceUuid: HOLY_STRIKES_UUID,
                    stage2ChoiceUuid: SACRED_RETRIBUTION_UUID,
                    stage3ChoiceUuid: BOW_OF_CELESTIAL_JUDGEMENT_UUID
                })
            },
            finalAssertions: async ({actor, assert}) =>
            {
                const actorProf = actor.system.attributes.prof
                const actorDto = new ActorValidationDTO(actor)

                actorDto.hasItemWithSourceUuids = [
                    CELESTIAL_FORM_UUID,
                    PLANAR_BINDING_UUID,
                    HOLY_STRIKES_UUID,
                    BLINDING_RADIANCE_UUID,
                    SACRED_RETRIBUTION_UUID,
                    BEACON_TO_DARKNESS_UUID,
                    BOW_OF_CELESTIAL_JUDGEMENT_UUID
                ]
                actorDto.stats.resistances = ["radiant"]
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })

                addSeraphRaceItemAssertion(actorDto)
                addCelestialFormItemAssertions(actorDto)
                addPlanarBindingItemAssertions(actorDto)
                addHolyStrikesItemAssertions(actorDto, {
                    actorProf,
                    stage: 3
                })
                addBlindingRadianceItemAssertions(actorDto)
                addSacredRetributionItemAssertions(actorDto, {
                    usesMax: 3
                })
                addBeaconToDarknessItemAssertions(actorDto)
                addBowOfCelestialJudgementItemAssertions(actorDto, {
                    usesMax: 3
                })

                validate(actorDto, {assert})
                assertSeraphSubtype({actor, assert})
            }
        }
    ],
    itemBehaviorTests: [
        ...blindingRadianceTriggerCases,
        ...blindingRadianceActivityUseCases,
        ...blindingRadianceNonTriggerCases,
        ...blindingRadianceSavingThrowCases
    ]
}
