import { ATTRIBUTE } from "../../../../config/constants.js"
import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"

const PLANAR_BINDING_UUID =
    "Compendium.transformations.gh-transformations.Item.RflKgCdUDzmk0VVK"
const PRIMORDIAL_FORM_UUID =
    "Compendium.transformations.gh-transformations.Item.sdlQQx2dFDGz90JS"
const ELEMENTAL_AFFINITY_UUID =
    "Compendium.transformations.gh-transformations.Item.tweEfP6HNJMhAbME"
const ELEMENTAL_AFFINITY_CHOICE_UUID =
    "Compendium.transformations.gh-transformations.Item.8QOm4EyMBD4jjNwS"
const SECOND_ELEMENTAL_AFFINITY_CHOICE_UUID =
    "Compendium.transformations.gh-transformations.Item.grBkv7vIBfOVvnUg"
const ROILING_ELEMENTS_UUID =
    "Compendium.transformations.gh-transformations.Item.4QeF6uxf922byGo2"
const ELEMENTAL_FORM_REVEALED_EFFECT_NAME = "Elemental Form Revealed"
const DUAL_NATURE_UUID =
    "Compendium.transformations.gh-transformations.Item.qfQZKVnq3wkuTBh6"
const ELEMENTAL_SURGE_UUID =
    "Compendium.transformations.gh-transformations.Item.pf2FTD9AFlTvmeDU"
const placeholderChoices = Object.freeze([
    {name: "Primordial Stage 1 Choice A", uuid: ""},
    {name: "Primordial Stage 1 Choice B", uuid: ""},
    {name: "Primordial Stage 2 Choice A", uuid: ""},
    {name: "Primordial Stage 2 Choice B", uuid: ""},
    {name: "Primordial Stage 3 Choice A", uuid: ""},
    {name: "Primordial Stage 3 Choice B", uuid: ""},
    {name: "Primordial Stage 4 Choice A", uuid: ""},
    {name: "Primordial Stage 4 Choice B", uuid: ""}
])

function setupPrimordialElementalAffinityAdvancement()
{
    globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
        {
            name: "Elemental Affinity",
            choice: ELEMENTAL_AFFINITY_CHOICE_UUID
        }
    ]
}

function buildPrimordialRequiredPath(stage)
{
    const path = [{stage: 1}]

    if (stage >= 2) {
        path.push({stage: 2, choose: ELEMENTAL_SURGE_UUID})
    }

    return path
}

async function waitForElementalFormRevealedState({
    actor,
    runtime,
    waiters,
    present
})
{
    if (present) {
        await waiters.waitForCondition(() =>
            actor.effects.some(effect =>
                effect.name === ELEMENTAL_FORM_REVEALED_EFFECT_NAME
            )
        )
    }

    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
}

function assertElementalFormRevealedState({
    actor,
    assert,
    present
})
{
    const actorDto = new ActorValidationDTO(actor)

    if (present) {
        actorDto.effects.has.push(ELEMENTAL_FORM_REVEALED_EFFECT_NAME)
    } else {
        actorDto.effects.notHas.push(ELEMENTAL_FORM_REVEALED_EFFECT_NAME)
    }

    validate(actorDto, {assert})
}

const roilingElementsTriggerCases = [
    {
        name: "Roiling Elements saving throw success on bloodied",
        trigger: "bloodied",
        saveResult: 13,
        expectEffect: false
    },
    {
        name: "Roiling Elements saving throw fail on bloodied",
        trigger: "bloodied",
        saveResult: 12,
        expectEffect: true
    },
    {
        name: "Roiling Elements saving throw success on unconscious",
        trigger: "unconscious",
        saveResult: 13,
        expectEffect: false
    },
    {
        name: "Roiling Elements saving throw fail on unconscious",
        trigger: "unconscious",
        saveResult: 12,
        expectEffect: true
    }
].map(testCase => ({
    name: testCase.name,
    uuid: ROILING_ELEMENTS_UUID,
    requiredPath: buildPrimordialRequiredPath(2),
    setup: async () =>
    {
        setupPrimordialElementalAffinityAdvancement()
        globalThis.___TransformationTestEnvironment___.saveResult = testCase.saveResult
        globalThis.___TransformationTestEnvironment___.saveRolled = false
    },
    trigger: testCase.trigger,
    await: async ({actor, runtime, waiters}) =>
    {
        await waitForElementalFormRevealedState({
            actor,
            runtime,
            waiters,
            present: testCase.expectEffect
        })
    },
    assertions: async ({actor, assert}) =>
    {
        assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)
        assertElementalFormRevealedState({
            actor,
            assert,
            present: testCase.expectEffect
        })
    }
}))

const roilingElementsConditionCases = [
    {
        name: "Roiling Elements saving throw success on charmed",
        saveResult: 13,
        expectEffect: false,
        conditionName: "charmed"
    },
    {
        name: "Roiling Elements saving throw fail on charmed",
        saveResult: 12,
        expectEffect: true,
        conditionName: "charmed"
    },
    {
        name: "Roiling Elements saving throw success on frightened",
        saveResult: 13,
        expectEffect: false,
        conditionName: "frightened"
    },
    {
        name: "Roiling Elements saving throw fail on frightened",
        saveResult: 12,
        expectEffect: true,
        conditionName: "frightened"
    }
].map(testCase => ({
    name: testCase.name,
    uuid: ROILING_ELEMENTS_UUID,
    requiredPath: buildPrimordialRequiredPath(2),
    setup: async () =>
    {
        setupPrimordialElementalAffinityAdvancement()
        globalThis.___TransformationTestEnvironment___.saveResult = testCase.saveResult
        globalThis.___TransformationTestEnvironment___.saveRolled = false
    },
    steps: [
        async ({actor, runtime}) =>
        {
            await runtime.services.triggerRuntime.run("conditionApplied", actor, {
                conditions: {
                    current: {
                        name: testCase.conditionName
                    }
                }
            })
        }
    ],
    await: async ({actor, runtime, waiters}) =>
    {
        await waitForElementalFormRevealedState({
            actor,
            runtime,
            waiters,
            present: testCase.expectEffect
        })
    },
    assertions: async ({actor, assert}) =>
    {
        assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)
        assertElementalFormRevealedState({
            actor,
            assert,
            present: testCase.expectEffect
        })
    }
}))

const roilingElementsActivityUseCases = [
    {
        name: "Roiling Elements saving throw success on primordial transformation activity use",
        saveResult: 13,
        expectEffect: false
    },
    {
        name: "Roiling Elements saving throw fail on primordial transformation activity use",
        saveResult: 12,
        expectEffect: true
    }
].map(testCase => ({
    name: testCase.name,
    uuid: ROILING_ELEMENTS_UUID,
    requiredPath: buildPrimordialRequiredPath(2),
    setup: async () =>
    {
        setupPrimordialElementalAffinityAdvancement()
        globalThis.___TransformationTestEnvironment___.saveResult = testCase.saveResult
        globalThis.___TransformationTestEnvironment___.saveRolled = false
    },
    steps: [
        async ({actor, runtime}) =>
        {
            const elementalSurge = actor.items.find(item =>
                item.flags?.transformations?.sourceUuid === ELEMENTAL_SURGE_UUID
            )
            const activity = Object.values(elementalSurge?.system?.activities ?? {})[0] ?? null

            await runtime.services.triggerRuntime.run("activityUse", actor, {
                activities: {
                    current: {
                        activity: {
                            id: activity?._id ?? activity?.id ?? null,
                            name: activity?.name ?? "",
                            type: activity?.type ?? ""
                        },
                        item: {
                            id: elementalSurge?.id ?? null,
                            name: elementalSurge?.name ?? "",
                            uuid: elementalSurge?.uuid ?? null,
                            sourceUuid:
                                elementalSurge?.flags?.transformations?.sourceUuid ?? null,
                            type: elementalSurge?.type ?? "",
                            systemType: elementalSurge?.system?.type?.value ?? "",
                            systemSubType: elementalSurge?.system?.type?.subtype ?? ""
                        }
                    }
                }
            })
        }
    ],
    await: async ({actor, runtime, waiters}) =>
    {
        await waitForElementalFormRevealedState({
            actor,
            runtime,
            waiters,
            present: testCase.expectEffect
        })
    },
    assertions: async ({actor, assert}) =>
    {
        assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)
        assertElementalFormRevealedState({
            actor,
            assert,
            present: testCase.expectEffect
        })
    }
}))

const roilingElementsNonTriggerCases = [
    {
        name: "Roiling Elements does not trigger on non-primordial transformation activity use",
        steps: [
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
        ]
    },
    {
        name: "Roiling Elements does not trigger on non-condition effect application",
        steps: [
            async ({actor, runtime}) =>
            {
                await runtime.services.triggerRuntime.run("conditionApplied", actor, {
                    conditions: {
                        current: {
                            name: "prone"
                        }
                    }
                })
            }
        ]
    }
].map(testCase => ({
    name: testCase.name,
    uuid: ROILING_ELEMENTS_UUID,
    requiredPath: buildPrimordialRequiredPath(2),
    setup: async () =>
    {
        setupPrimordialElementalAffinityAdvancement()
        globalThis.___TransformationTestEnvironment___.saveRolled = false
    },
    steps: testCase.steps,
    await: async ({actor, runtime, waiters}) =>
    {
        await waitForElementalFormRevealedState({
            actor,
            runtime,
            waiters,
            present: false
        })
    },
    assertions: async ({actor, assert}) =>
    {
        assert.isFalse(globalThis.___TransformationTestEnvironment___.saveRolled)
        assertElementalFormRevealedState({
            actor,
            assert,
            present: false
        })
    }
}))

const roilingElementsSavingThrowCases = [
    {
        name: "Roiling Elements does not trigger on savingThrow runtime event",
        steps: [
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
    uuid: ROILING_ELEMENTS_UUID,
    requiredPath: buildPrimordialRequiredPath(2),
    setup: async () =>
    {
        setupPrimordialElementalAffinityAdvancement()
        globalThis.___TransformationTestEnvironment___.saveRolled = false
    },
    steps: testCase.steps,
    await: async ({actor, runtime, waiters}) =>
    {
        await waitForElementalFormRevealedState({
            actor,
            runtime,
            waiters,
            present: false
        })
    },
    assertions: async ({actor, assert}) =>
    {
        assert.strictEqual(
            globalThis.___TransformationTestEnvironment___.saveRolled,
            testCase.expectSaveRolled
        )
        assertElementalFormRevealedState({
            actor,
            assert,
            present: false
        })
    }
}))
export const primordialTestDef = {
    id: "primordial",
    name: "Primordial",
    rollTableOrigin: "NA",
    placeholders: {
        choices: placeholderChoices
    },
    scenarios: [
        {
            name: "stage 1 with Elemental Affinity",
            setup: async ({actor, staticVars}) =>
            {
                staticVars.initialCon = actor.system.abilities.con.value
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Elemental Affinity",
                        choice: ELEMENTAL_AFFINITY_CHOICE_UUID
                    }
                ]
            },
            steps: [
                {
                    stage: 1,
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
            finalAwait: async ({runtime, actor, waiters, staticVars}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                {
                    const raceItem = actor.items.find(item => item.type === "race")

                    return actor.system.abilities.con.value ===
                        Math.min(staticVars.initialCon + 1, 20) &&
                        raceItem?.system?.type?.subtype === "Elemental" &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            PLANAR_BINDING_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            PRIMORDIAL_FORM_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ELEMENTAL_AFFINITY_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ELEMENTAL_AFFINITY_CHOICE_UUID
                        )
                })
            },
            finalAssertions: async ({actor, assert, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    PLANAR_BINDING_UUID,
                    PRIMORDIAL_FORM_UUID,
                    ELEMENTAL_AFFINITY_UUID,
                    ELEMENTAL_AFFINITY_CHOICE_UUID
                ]
                actorDto.abilities.con.value =
                    Math.min(staticVars.initialCon + 1, 20)
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Elemental"
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [PLANAR_BINDING_UUID]
                    item.itemName = "Planar Binding"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
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
                    item.expectedItemUuids = [PRIMORDIAL_FORM_UUID]
                    item.itemName = "Primordial Form"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfEffects = 1
                    item.addEffect(effect =>
                    {
                        effect.name = "Primordial Form"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.abilities.con.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: 1
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [ELEMENTAL_AFFINITY_UUID]
                    item.itemName = "Elemental Affinity"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfEffects = 0
                    item.addAdvancement(advancement =>
                    {
                        advancement.addConfiguration(() => {})
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 2 with Dual Nature",
            setup: async ({actor, staticVars}) =>
            {
                staticVars.initialCon = actor.system.abilities.con.value
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Elemental Affinity",
                        choice: ELEMENTAL_AFFINITY_CHOICE_UUID
                    },
                    {
                        name: "Dual Nature",
                        choice: SECOND_ELEMENTAL_AFFINITY_CHOICE_UUID
                    }
                ]
            },
            steps: [
                {
                    stage: 1,
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
                    choose: DUAL_NATURE_UUID,
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
            finalAwait: async ({runtime, actor, waiters, staticVars}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                {
                    const raceItem = actor.items.find(item => item.type === "race")

                    return actor.system.abilities.con.value ===
                        Math.min(staticVars.initialCon + 1, 20) &&
                        raceItem?.system?.type?.subtype === "Elemental" &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ROILING_ELEMENTS_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            DUAL_NATURE_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            SECOND_ELEMENTAL_AFFINITY_CHOICE_UUID
                        )
                })
            },
            finalAssertions: async ({actor, assert, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    PLANAR_BINDING_UUID,
                    PRIMORDIAL_FORM_UUID,
                    ELEMENTAL_AFFINITY_UUID,
                    ELEMENTAL_AFFINITY_CHOICE_UUID,
                    ROILING_ELEMENTS_UUID,
                    DUAL_NATURE_UUID,
                    SECOND_ELEMENTAL_AFFINITY_CHOICE_UUID
                ]
                actorDto.abilities.con.value =
                    Math.min(staticVars.initialCon + 1, 20)
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Elemental"
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [ROILING_ELEMENTS_UUID]
                    item.itemName = "Roiling Elements"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 1
                    item.addActivity(activity =>
                    {
                        activity.activationType = "special"
                        activity.saveAbility = ["con"]
                        activity.addEffect(effect =>
                        {
                            effect.name = "Elemental Form Revealed"
                        })
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Elemental Form Revealed"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "flags.midi-qol.disadvantage.all",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: ""
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [DUAL_NATURE_UUID]
                    item.itemName = "Dual Nature"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 0
                    item.numberOfEffects = 0
                    item.addAdvancement(advancement =>
                    {
                        advancement.addConfiguration(() => {})
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 2 with Elemental Surge",
            setup: async ({actor, staticVars}) =>
            {
                staticVars.initialCon = actor.system.abilities.con.value
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Elemental Affinity",
                        choice: ELEMENTAL_AFFINITY_CHOICE_UUID
                    }
                ]
            },
            steps: [
                {
                    stage: 1,
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
                    choose: ELEMENTAL_SURGE_UUID,
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
            finalAwait: async ({runtime, actor, waiters, staticVars}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                {
                    const raceItem = actor.items.find(item => item.type === "race")

                    return actor.system.abilities.con.value ===
                        Math.min(staticVars.initialCon + 1, 20) &&
                        raceItem?.system?.type?.subtype === "Elemental" &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ROILING_ELEMENTS_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ELEMENTAL_SURGE_UUID
                        )
                })
            },
            finalAssertions: async ({actor, assert, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    PLANAR_BINDING_UUID,
                    PRIMORDIAL_FORM_UUID,
                    ELEMENTAL_AFFINITY_UUID,
                    ELEMENTAL_AFFINITY_CHOICE_UUID,
                    ROILING_ELEMENTS_UUID,
                    ELEMENTAL_SURGE_UUID
                ]
                actorDto.abilities.con.value =
                    Math.min(staticVars.initialCon + 1, 20)
                actorDto.rollModes.disadvantage.push({
                    identifier: ATTRIBUTE.ROLLABLE.DEATH_SAVES
                })
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Elemental"
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [ROILING_ELEMENTS_UUID]
                    item.itemName = "Roiling Elements"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 1
                    item.addActivity(activity =>
                    {
                        activity.activationType = "special"
                        activity.saveAbility = ["con"]
                        activity.addEffect(effect =>
                        {
                            effect.name = "Elemental Form Revealed"
                        })
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Elemental Form Revealed"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "flags.midi-qol.disadvantage.all",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: ""
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [ELEMENTAL_SURGE_UUID]
                    item.itemName = "Elemental Surge"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 4
                    item.numberOfEffects = 0
                    item.addActivity(activity =>
                    {
                        activity.name = "Lightning Strike"
                        activity.activationType = "action"
                        activity.attackBonus = "@mod"
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.customEnabled = true
                            damagePart.custom =
                                "(3+(@flags.transformations.stage - 2))d8"
                            damagePart.bonus = ""
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["lightning"]
                        })
                    })
                    item.addActivity(activity =>
                    {
                        activity.name = "Earth Shard"
                        activity.activationType = "action"
                        activity.saveAbility = ["con"]
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.customEnabled = true
                            damagePart.custom =
                                "(3+(@flags.transformations.stage - 2))d6 + @mod"
                            damagePart.bonus = ""
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["bludgeoning"]
                        })
                    })
                    item.addActivity(activity =>
                    {
                        activity.name = "Flame Wave"
                        activity.activationType = "action"
                        activity.saveAbility = ["dex"]
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.customEnabled = true
                            damagePart.custom =
                                "(2+(@flags.transformations.stage - 2))d8 + @abilities.con.mod"
                            damagePart.bonus = ""
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["fire"]
                        })
                    })
                    item.addActivity(activity =>
                    {
                        activity.name = "Aquatic Rejuvenation"
                        activity.activationType = "action"
                    })
                })
                validate(actorDto, {assert})
            }
        }
    ],
    itemBehaviorTests: [
        ...roilingElementsTriggerCases,
        ...roilingElementsConditionCases,
        ...roilingElementsActivityUseCases,
        ...roilingElementsNonTriggerCases,
        ...roilingElementsSavingThrowCases
    ]
}
