import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js";
import { validate } from "../../../helpers/DTOValidators/validate.js";
import { EffectValidationDTO } from "../../../helpers/validationDTOs/effect/EffectValidationDTO.js";
import { Lich } from "../../../../domain/transformation/subclasses/lich/Lich.js";

function normalizeText(value)
{
    return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
}

function getUiWindows()
{
    const windows = ui?.windows
    if (!windows) return []

    if (typeof windows.values === "function") {
        return Array.from(windows.values())
    }

    return Object.values(windows).filter(Boolean)
}

function getApplicationRoot(application)
{
    if (
        application?.nodeType === Node.ELEMENT_NODE ||
        application instanceof ShadowRoot
    ) {
        return application
    }

    return (
        application?.element?.[0] ??
        application?.element ??
        application?.window?.content?.[0] ??
        application?.window?.content ??
        application?.window?.element?.[0] ??
        application?.window?.element ??
        null
    )
}

function queryAllIncludingShadowRoots(root, selector)
{
    const visitedRoots = new Set()
    const matchedElements = new Set()

    function visit(currentRoot)
    {
        if (!currentRoot || visitedRoots.has(currentRoot)) return
        if (typeof currentRoot.querySelectorAll !== "function") return

        visitedRoots.add(currentRoot)

        for (const element of currentRoot.querySelectorAll(selector)) {
            matchedElements.add(element)
        }

        for (const element of currentRoot.querySelectorAll("*")) {
            if (element?.shadowRoot) {
                visit(element.shadowRoot)
            }
        }
    }

    visit(root)

    if (root === document) {
        for (const application of getUiWindows()) {
            const applicationRoot = getApplicationRoot(application)
            visit(applicationRoot)
            visit(applicationRoot?.shadowRoot)
        }
    }

    return Array.from(matchedElements)
}

function findApplicationForElement(element)
{
    if (!element) return null

    for (const application of getUiWindows()) {
        const applicationRoot = getApplicationRoot(application)

        if (
            applicationRoot === element ||
            applicationRoot?.contains?.(element) ||
            applicationRoot?.shadowRoot === element.getRootNode?.() ||
            applicationRoot?.shadowRoot?.contains?.(element)
        )
        {
            return application
        }
    }

    const applicationElement =
              element.closest?.("[data-appid]") ??
              element.closest?.(".application") ??
              null
    const applicationId = applicationElement?.dataset?.appid

    return (
        (applicationId != null
            ? (ui?.windows?.[applicationId] ?? null)
            : null) ??
        getUiWindows().find(window =>
            String(window?.appId ?? window?.id ?? "") === String(applicationId ?? "")
        ) ??
        null
    )
}

function findActionElement(root, {
    action = null,
    type = null,
    text = null
} = {})
{
    const candidates = queryAllIncludingShadowRoots(
        root,
        "button, a, [data-action], [data-type]"
    )

    if (action != null) {
        const actionMatch = candidates.find(element =>
            element.dataset?.action === action
        )

        if (actionMatch) {
            return actionMatch
        }
    }

    if (type != null) {
        const typeMatch = candidates.find(element =>
            element.dataset?.type === type
        )

        if (typeMatch) {
            return typeMatch
        }
    }

    if (text != null) {
        const expectedText = normalizeText(text)

        return candidates.find(element =>
            normalizeText(element.textContent) === expectedText
        ) ?? null
    }

    return null
}

function findSelectContainingOptions(root, expectedOptions = [])
{
    const normalizedExpectedOptions = expectedOptions.map(option =>
        normalizeText(option).toLowerCase()
    )

    return queryAllIncludingShadowRoots(root, "select").find(select =>
    {
        const optionValues = Array.from(select.options ?? [])
        .map(option =>
            normalizeText(option.value || option.textContent).toLowerCase()
        )
        .filter(Boolean)

        return normalizedExpectedOptions.every(expectedOption =>
            optionValues.some(actualOption =>
                actualOption === expectedOption ||
                actualOption.includes(expectedOption)
            )
        )
    }) ?? null
}

function findDamageRollDialog()
{
    const expectedTitle =
              game.i18n?.localize?.("DND5E.DamageRoll") ??
              "Damage Roll"
    const applicationMatch = getUiWindows().find(application =>
    {
        if (!application) return false

        if (application.constructor?.name === "DamageRollConfigurationDialog") {
            return true
        }

        if (application.rollType === CONFIG.Dice.DamageRoll) {
            return true
        }

        return false
    }) ?? null

    if (applicationMatch) {
        return applicationMatch
    }

    return queryAllIncludingShadowRoots(
        document,
        "dialog.application.roll-configuration, .application.roll-configuration"
    ).find(element =>
        normalizeText(
            element.querySelector(".window-title")?.textContent
        ) === expectedTitle
    ) ?? null
}

function findAttackRollDialog()
{
    const expectedTitle =
              game.i18n?.localize?.("DND5E.AttackRoll") ??
              "Attack Roll"
    const applicationMatch = getUiWindows().find(application =>
    {
        if (!application) return false

        if (application.constructor?.name === "AttackRollConfigurationDialog") {
            return true
        }

        return false
    }) ?? null

    if (applicationMatch) {
        return applicationMatch
    }

    return queryAllIncludingShadowRoots(
        document,
        "dialog.application.roll-configuration, .application.roll-configuration"
    ).find(element =>
        normalizeText(
            element.querySelector(".window-title")?.textContent
        ) === expectedTitle
    ) ?? null
}

function getDamageTypeOptionsFromDialog(application)
{
    const applicationRoot = getApplicationRoot(application)
    const selectOptions = queryAllIncludingShadowRoots(
        applicationRoot,
        "select[name$='.damageType'] option"
    ).map(option =>
        normalizeText(option.value || option.textContent).toLowerCase()
    )
    .filter(Boolean)

    if (selectOptions.length) {
        return Array.from(new Set(selectOptions))
    }

    const types = (application?.rolls ?? [])
    .flatMap(roll => Array.from(roll?.options?.types ?? []))
    .filter(Boolean)

    return Array.from(new Set(types))
}

async function closeApplication(application)
{
    if (
        application?.nodeType === Node.ELEMENT_NODE ||
        application instanceof ShadowRoot
    ) {
        if (typeof application.close === "function") {
            application.close()
        }

        application.remove?.()
        return
    }

    if (typeof application?.close === "function") {
        await application.close({force: true})
        return
    }

    const applicationElement = getApplicationRoot(application)

    if (typeof applicationElement?.close === "function") {
        applicationElement.close()
    }

    applicationElement?.remove?.()
}

const MEMORI_LICHDOM_UUID =
          "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO"
const ACOLYTE_OF_UNDEATH_UUID =
          "Compendium.transformations.gh-transformations.Item.mYwSUxSiNQqP4mZ2"
const CORRUPTING_MAGIC_UUID =
          "Compendium.transformations.gh-transformations.Item.l4qP3E5fOFZjLpNT"
const ELDRITCH_CONCENTRATION_UUID =
          "Compendium.transformations.gh-transformations.Item.h0hvoW3lpVwBhbjk"
const HIDEOUS_APPEARANCE_EFFECT_NAME = "Hiding Hideous Appearance"
const SOUL_VESSEL_ITEM_NAME = "Soul Vessel"
const SOUL_VESSEL_CHARGED_FLAG_PATH = "transformations.lich.soulVesselCharged"
const lichStageOneRequiredPath = [
    {
        stage: 1,
        choose: MEMORI_LICHDOM_UUID
    }
]
const lichStageTwoRequiredPath = [
    {
        stage: 1,
        choose: MEMORI_LICHDOM_UUID
    },
    {
        stage: 2,
        choose: ACOLYTE_OF_UNDEATH_UUID
    }
]
const lichEldritchConcentrationRequiredPath = [
    {
        stage: 1,
        choose: MEMORI_LICHDOM_UUID
    },
    {
        stage: 2,
        choose: CORRUPTING_MAGIC_UUID
    },
    {
        stage: 3,
        choose: ELDRITCH_CONCENTRATION_UUID
    }
]

async function addWizardClass(actor, helpers)
{
    const foundCharacterClass = await helpers.getCharacterClass("Wizard")
    await helpers.createActorItemAndWait(
        actor,
        foundCharacterClass,
        {
            setTransformationFlags: false,
            setDdbImporterFlag: false,
            applyAdvancements: false,
            levels: 4
        }
    )
}

async function applyHidingHideousAppearance(actor, helpers)
{
    await helpers.applyItemActivityEffect({
        actor,
        itemName: "Hideous Appearance",
        effectName: HIDEOUS_APPEARANCE_EFFECT_NAME,
        macroTrigger: "on"
    })
}

function getSoulVessel(actor)
{
    const soulVessel = actor.items.find(item => item.name === SOUL_VESSEL_ITEM_NAME)

    if (!soulVessel) {
        throw new Error("Soul Vessel item not present on actor")
    }

    return soulVessel
}

function getItemActivity(actor, itemName, activityName)
{
    const item = actor.items.find(entry => entry.name === itemName)

    if (!item) {
        throw new Error(`${itemName} item not present on actor`)
    }

    const activity = item.system.activities.find(entry => entry.name === activityName)

    if (!activity) {
        throw new Error(`${activityName} activity not present on ${itemName}`)
    }

    return {item, activity}
}

async function updateSoulVesselUses(actor, changed)
{
    const soulVessel = getSoulVessel(actor)
    const options = {}

    await Lich.preUpdateItem({
        item: soulVessel,
        changed,
        options,
        actor
    })

    await soulVessel.update(changed)

    await Lich.updateItem({
        item: soulVessel,
        changed,
        options,
        actor
    })

    return soulVessel
}

export const lichTestDef = {
    id: "lich",
    name: "Lich",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: `stage 1 with Lich Magica`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.0wnk2ZQGOrwMvxH3",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.II56xBIJkjB5OoLV",
                    "Compendium.transformations.gh-transformations.Item.rluvw9sNdr3JO93n",
                    "Compendium.transformations.gh-transformations.Item.0wnk2ZQGOrwMvxH3"
                ]
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Undead"
                })
                actorDto.addItem(item =>
                {
                    item.itemName = "Undead Form"
                })
                actorDto.addItem(item => {
                    item.itemName = "Soul Vessel"
                    item.uses.max = 1
                    item.uses.spent = 1
                    item.addActivity(activity => {
                        activity.name = "Capture Soul"
                        activity.activationType = "action"
                        activity.uses.max = 2
                        activity.uses.spent = 0
                        activity.range.value = 60
                        activity.range.unit = "ft"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = 1
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 2
                            consumption.addTarget(target => {
                                target.type = "activity"
                                target.value = 1
                            })
                            consumption.addTarget(target => {
                                target.type = "item"
                                target.value = -1
                            })
                        })
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Place Soul Vessel"
                        activity.activationType = "special"
                        activity.addSummon(summon => {
                            summon.count = 1
                            summon.uuid = "Compendium.transformations.creatures.Actor.Ccn224flJTKl0ZDh"
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Create Soul Vessel"
                        activity.activationType = "special"
                        activity.uses.max = 1
                        activity.uses.spent = 0
                        activity.uses.addRecovery(recovery => {
                            recovery.period = "lr"
                            recovery.type = "recoverAll"
                        })
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                consumption.type = "activity"
                                consumption.value = 1
                            })
                        })
                        activity.addEffect(effect => {
                            effect.name = "Soul Vessel Active"
                            effect.description = "You have a soul vessel, as long as you have it you will resurrect if you die. unless it is destroyed."
                            effect.flags = {
                                dae: {
                                    selfTargetAlways: true
                                }
                            }
                        })
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Lich Magica"
                    item.addActivity(activity => {
                        activity.name = "Regain Spell Slot"
                        activity.activationType = "action"
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.target = "sould-vessel"
                                target.type = "itemUses"
                                target.value = 1
                            })
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Enforce Disadvantage"
                        activity.activationType = "action"
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.target = "sould-vessel"
                                target.type = "itemUses"
                                target.value = 1
                            })
                        })
                        activity.addEffect(effect => {
                            effect.name = "Enforce Disadvantage"
                            effect.description = "The next saving throw made before the end of your next turn against one of your spells has Disadvantage."
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Necrotic Damage"
                        activity.activationType = "special"
                        activity.critical.allow = true
                        activity.addDamagePart(damagePart => {
                            damagePart.custom = "(@flags.transformation.stage)d6"
                            damagePart.type = ['necrotic']
                        })
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.target = "sould-vessel"
                                target.type = "itemUses"
                                target.value = 1
                            })
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Lich Healing"
                        activity.activationType = "special"
                        activity.healing.custom = "(@flags.transformation.stage)d6"
                        activity.healing.types = ["healing"]
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.target = "sould-vessel"
                                target.type = "itemUses"
                                target.value = 1
                            })
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 1 with Memori Lichdom`,
            steps: [
                {
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                        await helpers.createActorItemAndWait(
                            actor,
                            foundCharacterClass,
                            {
                                setTransformationFlags: false,
                                setDdbImporterFlag: false,
                                applyAdvancements: false,
                                levels: 4
                            }
                        )
                    }
                },
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.II56xBIJkjB5OoLV",
                    "Compendium.transformations.gh-transformations.Item.rluvw9sNdr3JO93n",
                    "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Memori Lichdom"
                    item.addActivity(activity => {
                        activity.name = "Necrotic Damage"
                        activity.activationType = "bonus"
                        activity.target.affects.count = 1
                        activity.target.affects.type = "creature"
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Acolyte of Undeath`,
            steps: [
                {
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                        await helpers.createActorItemAndWait(
                            actor,
                            foundCharacterClass,
                            {
                                setTransformationFlags: false,
                                setDdbImporterFlag: false,
                                applyAdvancements: false,
                                levels: 4
                            }
                        )
                    }
                },
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.mYwSUxSiNQqP4mZ2",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.mYwSUxSiNQqP4mZ2",
                    "Compendium.transformations.gh-transformations.Item.b4rU3hux0unYcjCm"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Hideous Appearance"
                    item.addActivity(activity => {
                        activity.name = "Hide Hideous Appearance"
                        activity.activationType = "action"
                    })
                    item.addEffect(effect => {
                        effect.name = "Hiding Hideous Appearance"
                        effect.description = "You are Hiding your Hideous Form"
                    })
                    item.addActivity(activity => {
                        activity.name = "Saving Throw"
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Acolyte of Undeath"
                    item.addActivity(activity => {
                        activity.name = "Transform Into Zombie"
                        activity.activationType = "reaction"
                        activity.addSummon(summon => {
                            summon.count = 1
                            summon.uuid = "Compendium.transformations.creatures.Actor.HXxLcwk7jpvLY3Vg"
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Binding Curse`,
            steps: [
                {
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                        await helpers.createActorItemAndWait(
                            actor,
                            foundCharacterClass,
                            {
                                setTransformationFlags: false,
                                setDdbImporterFlag: false,
                                applyAdvancements: false,
                                levels: 4
                            }
                        )
                    }
                },
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.Vg6fukPM6JxwmoMb",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.Vg6fukPM6JxwmoMb"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Binding Curse"
                    item.uses.max = 3
                    item.uses.addRecovery(recovery => {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
                    item.uses.addRecovery(recovery => {
                        recovery.period = "sr"
                        recovery.type = "recoverAll"
                    })
                    item.addActivity(activity => {
                        activity.name = "Bind Creature"
                        activity.activationType = "bonus"
                        activity.duration.units = "minute"
                        activity.duration.value = 1
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.value = 1
                                target.type = "item"
                            })
                        })
                        activity.range.value = 30
                        activity.range.unit = "ft"
                        activity.target.value = 1
                        activity.target.type = "creature"
                        activity.saveAbility = ["cha"]
                        activity.saveDc = 14
                        activity.addEffect(effect => {
                            effect.name = "Binding Curse"
                            effect.description = "This creature cannot move more than 30 feet away from the lich which cast the curse.Whenever the Lich attacks this creature, weapon attacks and unarmed strikes deals an additional 2d6 Necrotic damage"
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Damage"
                        activity.addDamagePart(damagePart => {
                            damagePart.roll = "2d6"
                        })
                        activity.critical.allow = true
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Corrupting Magic`,
            steps: [
                {
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                        await helpers.createActorItemAndWait(
                            actor,
                            foundCharacterClass,
                            {
                                setTransformationFlags: false,
                                setDdbImporterFlag: false,
                                applyAdvancements: false,
                                levels: 4
                            }
                        )
                    }
                },
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.l4qP3E5fOFZjLpNT",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.l4qP3E5fOFZjLpNT"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Corrupting Magic"
                    item.addActivity(activity => {
                        activity.name = "Life Force"
                        activity.activationType = "special"
                        activity.healing.roll = "1d6"
                        activity.healing.type = "healing"
                    })
                    item.addActivity(activity => {
                        activity.name = "Poison"
                        activity.activationType = "special"
                        activity.range.unit = "special"
                        activity.range.special = "Within 10 ft from the killed creature"
                        activity.target.value = 1
                        activity.target.type = "creature"
                        activity.addDamagePart(damagePart => {
                            damagePart.roll = "1d6"
                            damagePart.type = "poison"
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Exhaustion"
                        activity.activationType = "special"
                        activity.range.unit = "special"
                        activity.range.special = "Within 10 ft from the killed creature"
                        activity.target.value = 1
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Eldritch Concentration`,
            steps: [
                {
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                        await helpers.createActorItemAndWait(
                            actor,
                            foundCharacterClass,
                            {
                                setTransformationFlags: false,
                                setDdbImporterFlag: false,
                                applyAdvancements: false,
                                levels: 4
                            }
                        )
                    }
                },
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.l4qP3E5fOFZjLpNT",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.h0hvoW3lpVwBhbjk",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.5Jr4ZiwRqJv1Lot9",
                    "Compendium.transformations.gh-transformations.Item.h0hvoW3lpVwBhbjk"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Necromantic Dystrophia"
                    item.addEffect(effect => {
                        effect.name = "Necromantic Dystrophia"
                        effect.changes = [
                            {
                                key: "system.abilities.con.check.roll.mode",
                                value: -1,
                                mode: 2
                            }
                        ]
                        effect.flags = {
                            dae: {
                                enableCondition: "@flags.transformations.lich.soulVesselCharged != 0"
                            }
                        }
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Eldritch Concentration"
                    item.uses.max = 1
                    item.uses.addRecovery(recovery => {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
                    item.uses.addRecovery(recovery => {
                        recovery.period = "sr"
                        recovery.type = "recoverAll"
                    })
                    item.addActivity(activity => {
                        activity.name = "Eldritch Concentration"
                        activity.activationType = "special"
                        activity.addConsumption(consumption => {
                            consumption.number = 1
                            consumption.addTarget(target => {
                                target.type = "item"
                                target.amount = 1
                            })
                        })
                        activity.addEffect(effect => {
                            effect.name = "Eldritch Concentration"
                            effect.changes = [
                                {
                                    key: "system.attributes.concentration.limit",
                                    mode: 2,
                                    value: 1
                                }
                            ]
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Master of Undeath`,
            steps: [
                {
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                        await helpers.createActorItemAndWait(
                            actor,
                            foundCharacterClass,
                            {
                                setTransformationFlags: false,
                                setDdbImporterFlag: false,
                                applyAdvancements: false,
                                levels: 4
                            }
                        )
                    }
                },
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.mYwSUxSiNQqP4mZ2",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aEwUSvKYm17M9rRY",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.aEwUSvKYm17M9rRY"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Master of Undeath"
                    item.addActivity(activity => {
                        activity.name = "Lich Zombie Healing"
                        activity.activationType = "reaction"
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.type = "item"
                                target.amount = 1
                                target.target = "soul-vessel"
                            })
                        })
                        activity.range.type = "special"
                        activity.range.special = "Any undead creature controlled by a Lich ability"
                        activity.target.type = "special"
                        activity.target.value = 1
                        activity.range.special = "Any undead creature controlled by a Lich ability"
                        activity.healing.custom = 1
                        activity.healing.type = "healing"
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Unholy Healing`,
            steps: [
                {
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                        await helpers.createActorItemAndWait(
                            actor,
                            foundCharacterClass,
                            {
                                setTransformationFlags: false,
                                setDdbImporterFlag: false,
                                applyAdvancements: false,
                                levels: 4
                            }
                        )
                    }
                },
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.mYwSUxSiNQqP4mZ2",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.fxVTPJ9l8u4MJaJe",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.fxVTPJ9l8u4MJaJe"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Unholy Healing"
                    item.uses.max = 3
                    item.uses.addRecovery(recovery => {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
                    item.addActivity(activity => {
                        activity.name = "Activate Soul Vessel Healing"
                        activity.activationType = "action"
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.type = "item"
                                target.amount = 1
                            })
                        })
                        activity.addEffect(effect => {
                            effect.name = "Unholy Healing"
                            effect.description = "Your Soul vessel heals you 10 hp at the start of your turn for 1 minute"
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Heal on round start"
                        activity.activationType = "special"
                        activity.duration.value = 10
                        activity.duration.type = "turn"
                        activity.healing.type = "healing"
                        activity.healing.custom = "10"
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 4 with Eldritch Omniscience`,
            steps: [
                {
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                        await helpers.createActorItemAndWait(
                            actor,
                            foundCharacterClass,
                            {
                                setTransformationFlags: false,
                                setDdbImporterFlag: false,
                                applyAdvancements: false,
                                levels: 4
                            }
                        )
                    }
                },
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.mYwSUxSiNQqP4mZ2",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aEwUSvKYm17M9rRY",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.pTqaXSUUzxjXzMbZ",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.hPjZU5QFb77o2dMP",
                    "Compendium.transformations.gh-transformations.Item.pTqaXSUUzxjXzMbZ"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Weight of the Ages"
                })
                actorDto.addItem(item => {
                    item.itemName = "Eldritch Omniscience"
                    item.addActivity(activity => {
                        activity.name = "Capture Soul"
                        activity.activationType = "special"
                        activity.range.unit = "special"
                        activity.range.special = "Killed by one of your spells"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = 1
                        activity.target.affects.special = "Killed by one of your spells"
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.type = "item"
                                target.value = -1
                                target.target = "soul-vessel"
                            })
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 4 with Lord of Undeath`,
            steps: [
                {
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                        await helpers.createActorItemAndWait(
                            actor,
                            foundCharacterClass,
                            {
                                setTransformationFlags: false,
                                setDdbImporterFlag: false,
                                applyAdvancements: false,
                                levels: 4
                            }
                        )
                    }
                },
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.mYwSUxSiNQqP4mZ2",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aEwUSvKYm17M9rRY",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.X0WaGjUWo3zsu1sh",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.X0WaGjUWo3zsu1sh"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Lord of Undeath"
                    item.addActivity(activity => {
                        activity.name = "Transform Into Ghoul"
                        activity.activationType = "reaction"
                        activity.addSummon(summon => {
                            summon.count = 1
                            summon.uuid = "Compendium.transformations.creatures.Actor.9yFgkb5eigm0tNUI"
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 4 with Soul-Shattering Attack`,
            steps: [
                {
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                        await helpers.createActorItemAndWait(
                            actor,
                            foundCharacterClass,
                            {
                                setTransformationFlags: false,
                                setDdbImporterFlag: false,
                                applyAdvancements: false,
                                levels: 4
                            }
                        )
                    }
                },
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.mYwSUxSiNQqP4mZ2",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aEwUSvKYm17M9rRY",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.p5Ub9sHX1mCyNLEc",
                    await: async ({runtime, actor, waiters, helpers}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],
            finalAssertions: async ({actor, assert}) =>
            {
                const actorProf = actor.system.attributes.prof

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.p5Ub9sHX1mCyNLEc"
                ]

                actorDto.addItem(item => {
                    item.itemName = "Soul-Shattering Attack"
                    item.uses.max = 4 + actorProf
                    item.uses.addRecovery(recovery => {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
                })
                validate(actorDto, {assert})
            }
        }
    ],
    itemBehaviorTests: [
        {
            name: "Soul Vessel updates soulVesselCharged to false when uses reaches 0",

            requiredPath: lichStageOneRequiredPath,

            steps: [
                async ({actor}) =>
                {
                    await actor.update({
                        "flags.transformations.lich.soulVesselCharged": true
                    })

                    await updateSoulVesselUses(actor, {
                        "system.uses.value": 1,
                        "system.uses.spent": 0
                    })
                    await updateSoulVesselUses(actor, {
                        "system.uses.value": 0,
                        "system.uses.spent": 1
                    })
                }
            ],

            assertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.flags.match.push({
                    path: SOUL_VESSEL_CHARGED_FLAG_PATH,
                    expected: false
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: "Soul Vessel updates soulVesselCharged to true when uses remains above 0",

            requiredPath: lichStageOneRequiredPath,

            steps: [
                async ({actor}) =>
                {
                    await actor.update({
                        "flags.transformations.lich.soulVesselCharged": false
                    })

                    await updateSoulVesselUses(actor, {
                        "system.uses.value": 0,
                        "system.uses.spent": 1
                    })
                    await updateSoulVesselUses(actor, {
                        "system.uses.value": 1,
                        "system.uses.spent": 0
                    })
                }
            ],

            assertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.flags.match.push({
                    path: SOUL_VESSEL_CHARGED_FLAG_PATH,
                    expected: true
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `Lich Magica Regain Spell slot`,

            setup: async ({actor, helpers}) =>
            {
                const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                await helpers.createActorItemAndWait(
                    actor,
                    foundCharacterClass,
                    {
                        setTransformationFlags: false,
                        setDdbImporterFlag: false,
                        applyAdvancements: false,
                        levels: 4
                    }
                )
                await actor.update({
                    "system.spells.spell1.override": 2,
                    "system.spells.spell1.value": 0
                })
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "lich": {
                            1: "Compendium.transformations.gh-transformations.Item.0wnk2ZQGOrwMvxH3"
                        }
                    }
                })
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, waiters, staticVars}) =>
                {
                    const soulVessel = getSoulVessel(actor)

                    const soulVesselUsesMax = Math.max(
                        Number(soulVessel.system?.uses?.max ?? 0),
                        0
                    )
                    const soulVesselUsesSpent = Math.max(
                        Number(soulVessel.system?.uses?.spent ?? 0),
                        0
                    )

                    if (soulVesselUsesMax <= 0) {
                        throw new Error("Soul Vessel has no maximum uses configured")
                    }

                    if (soulVesselUsesMax - soulVesselUsesSpent <= 0) {
                        await soulVessel.update({
                            "system.uses.spent": Math.max(soulVesselUsesMax - 1, 0)
                        })
                    }

                    const lichMagica = actor.items.find(item => item.name === "Lich Magica")
                    if (!lichMagica) {
                        throw new Error("Lich Magica item not present on actor")
                    }

                    const regainSpellSlotActivity = lichMagica.system.activities.find(activity =>
                        activity.name === "Regain Spell Slot"
                    )
                    if (!regainSpellSlotActivity) {
                        throw new Error("Regain Spell Slot activity not present on Lich Magica")
                    }

                    staticVars.initialMessageIds = new Set(
                        game.messages.contents.map(message => message.id)
                    )

                    const activityUseResult = await regainSpellSlotActivity.use({actor})

                    staticVars.message =
                        game.messages.get(
                            activityUseResult?.message?.id ??
                            activityUseResult?.chatMessage?.id ??
                            activityUseResult?.changes?.message?.id ??
                            ""
                        ) ??
                        game.messages.contents.find(message =>
                            !staticVars.initialMessageIds.has(message.id)
                        ) ??
                        game.messages.contents.at(-1)

                    if (!staticVars.message) {
                        throw new Error("Regain Spell Slot activity did not create a chat message")
                    }

                    const messageSelector =
                              `.chat-message[data-message-id="${staticVars.message.id}"]`
                    const recoverButtonSelector =
                              `${messageSelector} [data-transformations-card][data-bound='true'] ` +
                              "[data-transformations-action='recoverSpellSlot']"

                    await waiters.waitForCondition(() =>
                        document.querySelector(recoverButtonSelector) != null
                    )

                    const recoverSpellSlotButton =
                              document.querySelector(recoverButtonSelector)

                    if (!recoverSpellSlotButton) {
                        throw new Error("Recover Spell Slot button not found on Lich Magica chat card")
                    }

                    recoverSpellSlotButton.click()
                    await waiters.waitForNextFrame()

                    const dialogSelector =
                              ".transformations-spell-slot-recovery-dialog, .transformations-spell-slot-recovery"

                    await waiters.waitForCondition(() =>
                        document.querySelector(dialogSelector) != null
                    )

                    const dialog = document.querySelector(dialogSelector)
                    if (!dialog) {
                        throw new Error("Lich Magica spell slot recovery dialog did not open")
                    }

                    const level1Group = Array.from(
                        dialog.querySelectorAll("[data-slot-group]")
                    ).find(group =>
                        group.querySelector(".transformations-spell-slot-recovery__level")
                        ?.textContent?.trim() === "1"
                    )

                    if (!level1Group) {
                        throw new Error("Level 1 spell slot group not found in Lich Magica dialog")
                    }

                    const level1Radio = level1Group.querySelector("[data-slot-radio]")
                    if (!level1Radio) {
                        throw new Error("No selectable level 1 spell slot found in Lich Magica dialog")
                    }

                    level1Radio.checked = true
                    level1Radio.dispatchEvent(new Event("change", {bubbles: true}))
                    await waiters.waitForNextFrame()

                    const confirmButton = dialog.querySelector("[data-action='confirm']")
                    if (!confirmButton) {
                        throw new Error("Lich Magica confirm button not found")
                    }

                    confirmButton.click()
                    await waiters.waitForNextFrame()

                    await waiters.waitForCondition(() =>
                        document.querySelector(dialogSelector) == null
                    )
                }
            ],

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert, waiters}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.system.spells?.spell1?.value === 1
                )

                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.spellSlots.spell1.value = 1
                actorDto.stats.spellSlots.spell1.override = 2
                validate(actorDto, {assert})
            }
        },
        {
            name: `Memori Lichdom, unarmed strike has choice of force or bludgeoning damage`,

            setup: async ({actor, helpers, staticVars}) =>
            {
                staticVars.originalDice3d = game.dice3d
                game.dice3d = {
                    isEnabled() {
                        return false
                    },
                    async showForRoll() {}
                }

                const unarmedStrike = await helpers.getDndItem("Unarmed Strike")
                await helpers.createActorItemAndWait(
                    actor,
                    unarmedStrike
                )
                const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                await helpers.createActorItemAndWait(
                    actor,
                    foundCharacterClass,
                    {
                        setTransformationFlags: false,
                        setDdbImporterFlag: false,
                        applyAdvancements: false,
                        levels: 4
                    }
                )
                await actor.update({
                    "system.spells.spell1.override": 2,
                    "system.spells.spell1.value": 0
                })
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "lich": {
                            1: "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO"
                        }
                    }
                })
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, waiters, staticVars}) =>
                {
                    const unarmedStrike = actor.items.find(i => i.name === "Unarmed Strike")
                    if (!unarmedStrike) {
                        throw new Error("Unarmed Strike item not present on actor")
                    }

                    staticVars.initialMessageIds = new Set(
                        game.messages.contents.map(message => message.id)
                    )

                    const activityUseResult = await unarmedStrike.use({actor})

                    await waiters.waitForCondition(() =>
                        Boolean(
                            game.messages.get(
                                activityUseResult?.message?.id ??
                                activityUseResult?.chatMessage?.id ??
                                activityUseResult?.changes?.message?.id ??
                                ""
                            )
                        ) ||
                        game.messages.contents.some(message =>
                            !staticVars.initialMessageIds.has(message.id)
                        )
                    )

                    staticVars.message =
                        game.messages.get(
                            activityUseResult?.message?.id ??
                            activityUseResult?.chatMessage?.id ??
                            activityUseResult?.changes?.message?.id ??
                            ""
                        ) ??
                        game.messages.contents.find(message =>
                            !staticVars.initialMessageIds.has(message.id)
                        ) ??
                        game.messages.contents.at(-1)

                    if (!staticVars.message) {
                        throw new Error("Unarmed Strike activity did not create a chat message")
                    }

                    staticVars.messageSelector =
                        `.chat-message[data-message-id="${staticVars.message.id}"]`
                }
            ],

            await: async ({waiters, staticVars}) =>
            {
                await waiters.waitForCondition(() =>
                {
                    const messageRoot = document.querySelector(staticVars.messageSelector)
                    if (!messageRoot) return false

                    const attackButton =
                              findActionElement(messageRoot, {action: "rollAttack"}) ??
                              findActionElement(messageRoot, {text: "Attack"})

                    return attackButton != null
                }, {
                    errorMessage:
                        "Unarmed Strike chat message did not render Attack button"
                })

                const messageRoot = document.querySelector(staticVars.messageSelector)
                const attackButton =
                          findActionElement(messageRoot, {action: "rollAttack"}) ??
                          findActionElement(messageRoot, {text: "Attack"})
                if (!attackButton) {
                    throw new Error("Expected Attack button on Unarmed Strike chat card")
                }

                attackButton.click()
                await waiters.waitForNextFrame()

                await waiters.waitForCondition(() =>
                {
                    const attackRollDialog = findAttackRollDialog()
                    if (!attackRollDialog) return false

                    staticVars.attackRollDialog = attackRollDialog
                    const normalButton =
                              findActionElement(
                                  getApplicationRoot(attackRollDialog),
                                  {action: "normal"}
                              ) ??
                              findActionElement(
                                  getApplicationRoot(attackRollDialog),
                                  {text: "Normal"}
                              )

                    return normalButton != null
                }, {
                    errorMessage:
                        "Attack roll configuration dialog did not render Normal button"
                })

                const normalButton =
                          findActionElement(
                              getApplicationRoot(staticVars.attackRollDialog),
                              {action: "normal"}
                          ) ??
                          findActionElement(
                              getApplicationRoot(staticVars.attackRollDialog),
                              {text: "Normal"}
                          )

                if (!normalButton) {
                    throw new Error(
                        "Expected Normal button in attack roll configuration dialog"
                    )
                }

                normalButton.click()
                await waiters.waitForNextFrame()

                await waiters.waitForCondition(() =>
                {
                    const damageRollDialog = findDamageRollDialog()
                    if (!damageRollDialog) return false

                    staticVars.damageRollDialog = damageRollDialog
                    const damageTypeOptions =
                              getDamageTypeOptionsFromDialog(damageRollDialog)

                    staticVars.damageTypeOptions = damageTypeOptions

                    return (
                        damageTypeOptions.includes("force") &&
                        damageTypeOptions.includes("bludgeoning")
                    )
                }, {
                    errorMessage:
                        "Selecting Normal on the attack roll dialog did not open the damage roll dialog with force and bludgeoning choices"
                })
            },

            assertions: async ({expect, waiters, staticVars}) =>
            {
                try {
                    const optionValues =
                              staticVars.damageTypeOptions ??
                              getDamageTypeOptionsFromDialog(staticVars.damageRollDialog)

                    expect(optionValues).to.include("force")
                    expect(optionValues).to.include("bludgeoning")

                    const application =
                              staticVars.damageRollDialog

                    await closeApplication(application)

                    await waiters.waitForNextFrame()
                } finally {
                    game.dice3d = staticVars.originalDice3d
                }
            }
        },
        {
            name: "Hideous Appearance hide hideous form",

            setup: async ({actor, helpers}) =>
            {
                await addWizardClass(actor, helpers)
            },

            requiredPath: lichStageTwoRequiredPath,

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingHideousAppearance(actor, helpers)
                }
            ],

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push(HIDEOUS_APPEARANCE_EFFECT_NAME)

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },
        {
            name: "Hideous Appearance saving throw success on bloodied",

            setup: async ({actor, helpers}) =>
            {
                await addWizardClass(actor, helpers)
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            requiredPath: lichStageTwoRequiredPath,

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingHideousAppearance(actor, helpers)
                }
            ],

            trigger: "bloodied",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push(HIDEOUS_APPEARANCE_EFFECT_NAME)

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },
        {
            name: "Hideous Appearance saving throw fail on bloodied",

            setup: async ({actor, helpers}) =>
            {
                await addWizardClass(actor, helpers)
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            requiredPath: lichStageTwoRequiredPath,

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingHideousAppearance(actor, helpers)
                }
            ],

            trigger: "bloodied",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 0
                effectDto.notHas.push(HIDEOUS_APPEARANCE_EFFECT_NAME)

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },
        {
            name: "Hideous Appearance saving throw success on unconscious",

            setup: async ({actor, helpers}) =>
            {
                await addWizardClass(actor, helpers)
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            requiredPath: lichStageTwoRequiredPath,

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingHideousAppearance(actor, helpers)
                }
            ],

            trigger: "unconscious",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push(HIDEOUS_APPEARANCE_EFFECT_NAME)

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },
        {
            name: "Hideous Appearance saving throw fail on unconscious",

            setup: async ({actor, helpers}) =>
            {
                await addWizardClass(actor, helpers)
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            requiredPath: lichStageTwoRequiredPath,

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingHideousAppearance(actor, helpers)
                }
            ],

            trigger: "unconscious",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 0
                effectDto.notHas.push(HIDEOUS_APPEARANCE_EFFECT_NAME)

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },
        {
            name: "Hideous Appearance saving throw success on beginConcentration",

            setup: async ({actor, helpers}) =>
            {
                await addWizardClass(actor, helpers)
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            requiredPath: lichStageTwoRequiredPath,

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingHideousAppearance(actor, helpers)
                }
            ],

            trigger: "concentration",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 1
                effectDto.has.push(HIDEOUS_APPEARANCE_EFFECT_NAME)

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },
        {
            name: "Hideous Appearance saving throw fail on beginConcentration",

            setup: async ({actor, helpers}) =>
            {
                await addWizardClass(actor, helpers)
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            requiredPath: lichStageTwoRequiredPath,

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingHideousAppearance(actor, helpers)
                }
            ],

            trigger: "concentration",

            await: async ({runtime, waiters, actor}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({actor, assert}) =>
            {
                assert.isTrue(globalThis.___TransformationTestEnvironment___.saveRolled)

                const actorDto = new ActorValidationDTO(actor)
                const effectDto = new EffectValidationDTO()
                effectDto.count = 0
                effectDto.notHas.push(HIDEOUS_APPEARANCE_EFFECT_NAME)

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },
        {
            name: "Eldritch Concentration adds one exhaustion level on use",

            setup: async ({actor, helpers}) =>
            {
                await addWizardClass(actor, helpers)
            },

            requiredPath: lichEldritchConcentrationRequiredPath,

            steps: [
                async ({actor, runtime, staticVars}) =>
                {
                    const soulVessel = getSoulVessel(actor)

                    await soulVessel.update({
                        "system.uses.spent": 0
                    })

                    const {item, activity} = getItemActivity(
                        actor,
                        "Eldritch Concentration",
                        "Eldritch Concentration"
                    )

                    staticVars.initialExhaustion =
                        Number(actor.system?.attributes?.exhaustion) || 0

                    await Lich.onActivityUse(
                        activity,
                        {
                            workflow: {
                                actor,
                                item
                            }
                        },
                        null,
                        runtime.infrastructure.actorRepository
                    )
                }
            ],

            await: async ({runtime, waiters, actor, staticVars}) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })

                await waiters.waitForCondition(() =>
                    (Number(actor.system?.attributes?.exhaustion) || 0) ===
                    ((Number(staticVars.initialExhaustion) || 0) + 1)
                )
            },

            assertions: async ({actor, assert, staticVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.exhaustion =
                    (Number(staticVars.initialExhaustion) || 0) + 1
                validate(actorDto, {assert})
            }
        }
    ]
}
