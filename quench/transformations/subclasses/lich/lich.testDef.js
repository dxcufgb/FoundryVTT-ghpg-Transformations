import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js";
import { validate } from "../../../helpers/DTOValidators/validate.js";

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
    return (
        application?.element?.[0] ??
        application?.element ??
        application?.window?.content ??
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
        ) {
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
    text = null
} = {})
{
    const candidates = Array.from(
        root?.querySelectorAll?.("button, a, [data-action]") ?? []
    )

    if (action != null) {
        const actionMatch = candidates.find(element =>
            element.dataset?.action === action
        )

        if (actionMatch) {
            return actionMatch
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
        }
    ],
    itemBehaviorTests: [
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
                    const soulVessel = actor.items.find(item => item.name === "Soul Vessel")
                    if (!soulVessel) {
                        throw new Error("Soul Vessel item not present on actor")
                    }

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
            name: `Lich Magica Regain Memori Lichdom, unarmed strike has choice of force or bludgeoning damage`,

            setup: async ({actor, helpers}) =>
            {
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
                        findActionElement(messageRoot, {action: "attack"}) ??
                        findActionElement(messageRoot, {text: "Attack"})
                    const damageButton =
                        findActionElement(messageRoot, {action: "damage"}) ??
                        findActionElement(messageRoot, {text: "Damage"})

                    return attackButton != null && damageButton != null
                }, {
                    errorMessage:
                        "Unarmed Strike chat message did not render Attack and Damage buttons"
                })
            },

            assertions: async ({expect, waiters, staticVars}) =>
            {
                const messageRoot = document.querySelector(staticVars.messageSelector)
                expect(messageRoot).to.exist

                const damageButton =
                    findActionElement(messageRoot, {action: "damage"}) ??
                    findActionElement(messageRoot, {text: "Damage"})

                expect(
                    damageButton,
                    "Expected Damage button on Unarmed Strike chat card"
                ).to.exist

                damageButton.click()
                await waiters.waitForNextFrame()

                await waiters.waitForCondition(() =>
                    findSelectContainingOptions(document, [
                        "force",
                        "bludgeoning"
                    ]) != null, {
                    errorMessage:
                        "Damage roll config dialog with force and bludgeoning choices did not open"
                })

                const damageTypeSelect = findSelectContainingOptions(document, [
                    "force",
                    "bludgeoning"
                ])

                expect(
                    damageTypeSelect,
                    "Expected damage type dropdown to include force and bludgeoning"
                ).to.exist

                const optionValues = Array.from(damageTypeSelect.options ?? [])
                .map(option =>
                    normalizeText(option.value || option.textContent).toLowerCase()
                )
                .filter(Boolean)

                expect(optionValues).to.include("force")
                expect(optionValues).to.include("bludgeoning")

                const application = findApplicationForElement(damageTypeSelect)

                if (application?.close) {
                    await application.close({force: true})
                } else {
                    const applicationElement =
                        damageTypeSelect.closest?.("[data-appid]") ??
                        damageTypeSelect.closest?.(".application") ??
                        null
                    applicationElement?.remove?.()
                }
            }
        }
    ]
}
