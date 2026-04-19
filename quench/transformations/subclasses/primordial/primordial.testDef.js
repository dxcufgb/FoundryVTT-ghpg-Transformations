import { ATTRIBUTE } from "../../../../config/constants.js"
import { ElementalImbalance } from "../../../../domain/transformation/subclasses/primordial/Feats/ElementalImbalance.js"
import { RollService } from "../../../../services/rolls/RollService.js"
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
const AURA_OF_AWAKENING_UUID =
          "Compendium.transformations.gh-transformations.Item.Cb8Zq6I3jiCBWtbZ"
const THIRD_ELEMENTAL_AFFINITY_CHOICE_UUID =
          "Compendium.transformations.gh-transformations.Item.sZ9Qi5uuN1UPmjd6"
const FOURTH_ELEMENTAL_AFFINITY_CHOICE_UUID =
          "Compendium.transformations.gh-transformations.Item.0RZMJNggMln9FDI7"
const MASTER_OF_MANY_UUID =
          "Compendium.transformations.gh-transformations.Item.uhNsp8cIvd8dsvlg"
const PRIMEVAL_BODY_UUID =
          "Compendium.transformations.gh-transformations.Item.gQZ0xl368qBi0zzP"
const ELEMENTAL_IMBALANCE_UUID =
          "Compendium.transformations.gh-transformations.Item.3QhO2SkFHqms1sIl"
const PRIMORDIAL_CHAOS_UUID =
          "Compendium.transformations.gh-transformations.Item.lYYCNPIBVXMQ5fAg"
const PRIMORDIAL_AURA_UUID =
          "Compendium.transformations.gh-transformations.Item.00vXc5RNzuZPXQui"
const ELEMENTAL_MASTERY_UUID =
          "Compendium.transformations.gh-transformations.Item.yDWkfqMrAMyFkVrO"
const elementalImbalanceBehaviorDamageTypes = Object.freeze([
    "acid",
    "cold",
    "fire",
    "lightning",
    "thunder"
])
const elementalImbalanceBehaviorCases = Object.freeze(
    elementalImbalanceBehaviorDamageTypes.flatMap(damageType => [
        {
            damageType,
            rollTotal: 1,
            expectVulnerability: true
        },
        {
            damageType,
            rollTotal: 4,
            expectVulnerability: false
        }
    ])
)
const elementalAffinityChoices = Object.freeze([
    {
        label: "choice 1",
        uuid: ELEMENTAL_AFFINITY_CHOICE_UUID
    },
    {
        label: "choice 2",
        uuid: SECOND_ELEMENTAL_AFFINITY_CHOICE_UUID
    },
    {
        label: "choice 3",
        uuid: THIRD_ELEMENTAL_AFFINITY_CHOICE_UUID
    },
    {
        label: "choice 4",
        uuid: FOURTH_ELEMENTAL_AFFINITY_CHOICE_UUID
    }
])
const primevalBodyChoices = Object.freeze([
    {
        label: "bludgeoning",
        choice: "dr:bludgeoning",
        damageType: "bludgeoning"
    },
    {
        label: "cold",
        choice: "dr:cold",
        damageType: "cold"
    },
    {
        label: "fire",
        choice: "dr:fire",
        damageType: "fire"
    },
    {
        label: "lightning",
        choice: "dr:lightning",
        damageType: "lightning"
    }
])
const primevalBodyLoopCases = Object.freeze(
    elementalAffinityChoices.flatMap(affinityChoice =>
        primevalBodyChoices.map(primevalBodyChoice => ({
            affinityChoice,
            primevalBodyChoice
        }))
    )
)
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

function installDamageRollDialogRenderSpy(staticVars)
{
    const DamageRollDialogClass = CONFIG.Dice?.DamageRoll?.DefaultConfigurationDialog
    const originalRender = DamageRollDialogClass?.prototype?.render

    staticVars.damageRollDialogClass = DamageRollDialogClass ?? null
    staticVars.originalDamageRollDialogRender = originalRender ?? null
    staticVars.damageRollDialogRendered = false
    staticVars.damageRollDialogApp = null

    if (!DamageRollDialogClass || typeof originalRender !== "function") {
        return
    }

    DamageRollDialogClass.prototype.render = function (...args)
    {
        staticVars.damageRollDialogRendered = true
        staticVars.damageRollDialogApp = this
        return originalRender.apply(this, args)
    }
}

function restoreDamageRollDialogRenderSpy(staticVars)
{
    if (
        staticVars?.damageRollDialogClass?.prototype &&
        typeof staticVars.originalDamageRollDialogRender === "function"
    ) {
        staticVars.damageRollDialogClass.prototype.render =
            staticVars.originalDamageRollDialogRender
    }
}

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

function getActorTraitValues(traitValues)
{
    return Array.from(traitValues ?? [])
}

function buildPrimevalBodyExpectedTraits({
    affinityDamageType,
    primevalDamageType
} = {})
{
    if (!affinityDamageType || !primevalDamageType) {
        return {
            resistances: [],
            immunities: []
        }
    }

    if (affinityDamageType === primevalDamageType) {
        return {
            resistances: [affinityDamageType],
            immunities: [primevalDamageType]
        }
    }

    return {
        resistances: [affinityDamageType, primevalDamageType],
        immunities: []
    }
}

function buildElementalImbalanceRequiredPath()
{
    return [
        {stage: 1},
        {
            stage: 2,
            choose: ELEMENTAL_SURGE_UUID
        },
        {
            stage: 3,
            choose: AURA_OF_AWAKENING_UUID
        }
    ]
}

function buildPrimordialChaosRequiredPath()
{
    return [
        ...buildElementalImbalanceRequiredPath(),
        {stage: 4}
    ]
}

function getCurrentMessage(message)
{
    return game.messages?.get(message?.id) ?? message ?? null
}

function findLatestElementalImbalanceMessage()
{
    return [...(game.messages?.contents ?? [])].reverse().find(message =>
        message?.flags?.transformations?.primordialActivity ===
        ElementalImbalance.id
    ) ?? null
}

function resolvePrimordialChaosItem(actor)
{
    return actor?.items?.find(item =>
        item?.flags?.transformations?.sourceUuid === PRIMORDIAL_CHAOS_UUID
    ) ?? null
}

function resolvePrimordialChaosActivity(item)
{
    return item?.system?.activities?.get?.("atkAWEqTesrELCv8") ??
        item?.system?.activities?.find?.(activity =>
            activity?.id === "atkAWEqTesrELCv8" ||
            activity?._id === "atkAWEqTesrELCv8"
        ) ??
        Object.values(item?.system?.activities ?? {}).find(activity =>
            activity?.id === "atkAWEqTesrELCv8" ||
            activity?._id === "atkAWEqTesrELCv8"
        ) ??
        null
}

function findLatestPrimordialChaosMessage({
    actor,
    chaosItem = null,
    chaosActivity = null,
    initialMessageIds = null
} = {})
{
    const messages = [...(game.messages?.contents ?? [])]
    const candidates = initialMessageIds
        ? messages.filter(message => !initialMessageIds.has(message.id))
        : messages

    return [...candidates].reverse().find(message =>
    {
        if (
            chaosActivity?.uuid &&
            message?.flags?.dnd5e?.activity?.uuid === chaosActivity.uuid
        ) {
            return true
        }

        if (
            chaosItem?.uuid &&
            message?.flags?.dnd5e?.item?.uuid === chaosItem.uuid
        ) {
            return true
        }

        if (
            actor?.id &&
            message?.speaker?.actor === actor.id &&
            String(message?.content ?? "").includes("Primordial Chaos")
        ) {
            return true
        }

        return false
    }) ?? null
}

function getElementalImbalanceEffectName(damageType)
{
    return ElementalImbalance.buildVulnerabilityEffectName(
        ElementalImbalance.getDamageTypeLabel(damageType)
    )
}

async function bindElementalImbalanceCard({
    actor,
    runtime,
    message
})
{
    const currentMessage = getCurrentMessage(message)
    const html = document.createElement("div")
    html.innerHTML = currentMessage?.content ?? ""

    const transformation =
              runtime.services.transformationRegistry.getEntryForActor(actor)

    await transformation.TransformationClass.onRenderChatMessage({
        message: currentMessage,
        html,
        actor,
        activeEffectRepository: runtime.infrastructure.activeEffectRepository,
        ChatMessagePartInjector: runtime.ui.ChatMessagePartInjector,
        RollService
    })

    return html
}

async function clickElementalImbalanceCardButton({
    actor,
    runtime,
    message,
    waiters,
    selector
})
{
    const html = await bindElementalImbalanceCard({
        actor,
        runtime,
        message
    })
    const button = html.querySelector(selector)

    if (!button) {
        throw new Error(
            `Elemental Imbalance chat card button not found for selector ${selector}`
        )
    }

    button.click()
    await waiters.waitForNextFrame()
}

async function prepareElementalImbalanceChatCard({
    actor,
    runtime,
    helpers,
    waiters,
    staticVars,
    damageType,
    damageAmount = 12
})
{
    const transformation =
              runtime.services.transformationRegistry.getEntryForActor(actor)

    staticVars.initialMessageIds = new Set(
        game.messages.contents.map(message => message.id)
    )
    staticVars.damageAmount = damageAmount

    await transformation.TransformationClass.onPreCalculateDamage({
        actor,
        damage: {
            amount: damageAmount
        },
        details: {
            type: damageType
        }
    })

    await waiters.waitForCondition(() =>
    {
        const message = findLatestElementalImbalanceMessage()

        return Boolean(
            message &&
            !staticVars.initialMessageIds.has(message.id)
        )
    })

    staticVars.message = findLatestElementalImbalanceMessage()
    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
        message: staticVars.message
    })
    await staticVars.chatCardHelper.waitForCard({
        preferLive: false
    })
}

async function preparePrimordialChaosMessage({
    actor,
    runtime,
    waiters,
    staticVars,
    naturalRoll = 1,
    total = 1,
    success = false,
    isSpell = true
})
{
    staticVars.chaosItem = resolvePrimordialChaosItem(actor)
    staticVars.chaosActivity = resolvePrimordialChaosActivity(staticVars.chaosItem)
    staticVars.initialMessageIds = new Set(
        game.messages.contents.map(message => message.id)
    )

    await runtime.services.triggerRuntime.run("savingThrow", actor, {
        saves: {
            current: {
                ability: "con",
                isSpell,
                naturalRoll,
                total,
                success
            }
        }
    })

    await waiters.waitForCondition(() =>
    {
        const message = findLatestPrimordialChaosMessage({
            actor,
            chaosItem: staticVars.chaosItem,
            chaosActivity: staticVars.chaosActivity,
            initialMessageIds: staticVars.initialMessageIds
        })

        return Boolean(message)
    })

    staticVars.message = findLatestPrimordialChaosMessage({
        actor,
        chaosItem: staticVars.chaosItem,
        chaosActivity: staticVars.chaosActivity,
        initialMessageIds: staticVars.initialMessageIds
    })
    staticVars.messageSelector =
        `.chat-message[data-message-id="${staticVars.message?.id}"]`
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

const elementalImbalanceBehaviorTests = [
    {
        name: ({damageType, rollTotal}) =>
            `Elemental Imbalance reacts to ${damageType} damage with a ${rollTotal} on the volatile reaction roll`,
        loop: () => elementalImbalanceBehaviorCases,
        uuid: ELEMENTAL_IMBALANCE_UUID,
        setup: async () =>
        {
            await ChatMessage.deleteDocuments(
                game.messages.contents.map(message => message.id)
            )
            setupPrimordialElementalAffinityAdvancement()
        },
        requiredPath: buildElementalImbalanceRequiredPath(),
        steps: [
            async ({actor, runtime, helpers, waiters, loopVars, staticVars}) =>
            {
                await prepareElementalImbalanceChatCard({
                    actor,
                    runtime,
                    helpers,
                    waiters,
                    staticVars,
                    damageType: loopVars.damageType
                })
            }
        ],
        assertions: async ({
            actor,
            runtime,
            helpers,
            waiters,
            expect,
            assert,
            loopVars,
            staticVars
        }) =>
        {
            const {
                      chatCardHelper
                  } = staticVars
            const damageTypeLabel =
                      ElementalImbalance.getDamageTypeLabel(loopVars.damageType)
            const effectName = getElementalImbalanceEffectName(loopVars.damageType)
            const rollHelper = helpers.createDeterministicRollHelper()

            try {
                const initialMessage = chatCardHelper.getMessage()

                expect(initialMessage).to.exist
                expect(initialMessage.flags?.transformations?.state).to.equal("initial")
                expect(initialMessage.flags?.transformations?.damageType).to.equal(
                    loopVars.damageType
                )
                expect(initialMessage.flags?.transformations?.originalDamage).to.equal(
                    staticVars.damageAmount
                )
                expect(initialMessage.content).to.contain(damageTypeLabel)
                expect(initialMessage.content).to.contain("Triggering damage:")

                const initialRoot = await bindElementalImbalanceCard({
                    actor,
                    runtime,
                    message: initialMessage
                })
                const rollButton =
                          initialRoot.querySelector("[data-primordial-action='roll']")

                expect(rollButton).to.exist
                expect(rollButton.textContent).to.contain("Roll")

                rollHelper.queueRoll({
                    formula: ElementalImbalance.rollFormula,
                    total: loopVars.rollTotal
                })

                await clickElementalImbalanceCardButton({
                    actor,
                    runtime,
                    message: initialMessage,
                    waiters,
                    selector: "[data-primordial-action='roll']"
                })

                await waiters.waitForCondition(() =>
                    rollHelper.getCalls().some(call =>
                        call.type === "roll" &&
                        call.formula === ElementalImbalance.rollFormula
                    )
                )

                const expectedState = loopVars.expectVulnerability
                    ? "rolled-triggered"
                    : "rolled-safe"

                await waiters.waitForCondition(() =>
                    chatCardHelper.getMessage()?.flags?.transformations?.state ===
                    expectedState
                )

                const presentedRolls =
                          await chatCardHelper.waitForPresentedRolls({
                              count: 1,
                              preferLive: false
                          })

                expect(presentedRolls[0]?.formula).to.equal(
                    ElementalImbalance.rollFormula
                )
                expect(presentedRolls[0]?.total).to.equal(loopVars.rollTotal)
                expect(
                    chatCardHelper.hasButton({
                        text: "Roll"
                    })
                ).to.equal(false)

                if (loopVars.expectVulnerability) {
                    await waiters.waitForCondition(() =>
                        actor.effects.some(effect => effect.name === effectName)
                    )
                    await waiters.waitForCondition(() =>
                        getActorTraitValues(actor.system.traits?.dv?.value).includes(
                            loopVars.damageType
                        )
                    )
                    expect(
                        chatCardHelper.getMessage()?.flags?.transformations?.vulnerabilityApplied
                    ).to.equal(true)

                    const saveCalls = []
                    const originalResolveSaveTargets =
                              ElementalImbalance.resolveSaveTargets
                    const originalRollSavingThrow = actor.rollSavingThrow

                    ElementalImbalance.resolveSaveTargets = () => [{
                        actor,
                        document: null
                    }]
                    actor.rollSavingThrow = async function rollSavingThrow(
                        config,
                        options,
                        messageOptions
                    )
                    {
                        saveCalls.push({
                            config,
                            options,
                            messageOptions
                        })

                        return {
                            total: 12
                        }
                    }

                    try {
                        const rolledRoot = await bindElementalImbalanceCard({
                            actor,
                            runtime,
                            message: chatCardHelper.getMessage()
                        })
                        const saveButton =
                                  rolledRoot.querySelector(
                                      "[data-primordial-action='roll-save']"
                                  )

                        expect(saveButton).to.exist
                        expect(saveButton.dataset.action).to.equal("rollSave")
                        expect(saveButton.dataset.ability).to.equal(
                            ElementalImbalance.saveAbility
                        )
                        expect(saveButton.dataset.dc).to.equal(
                            String(ElementalImbalance.saveDc)
                        )
                        expect(saveButton.dataset.visibility).to.equal("all")
                        expect(saveButton.textContent).to.contain("DC 15")

                        await clickElementalImbalanceCardButton({
                            actor,
                            runtime,
                            message: chatCardHelper.getMessage(),
                            waiters,
                            selector: "[data-primordial-action='roll-save']"
                        })

                        await waiters.waitForCondition(() =>
                            saveCalls.length === 1
                        )

                        expect(saveCalls[0]?.config?.ability).to.equal(
                            ElementalImbalance.saveAbility
                        )
                        expect(saveCalls[0]?.config?.target).to.equal(
                            ElementalImbalance.saveDc
                        )
                    } finally {
                        ElementalImbalance.resolveSaveTargets =
                            originalResolveSaveTargets
                        actor.rollSavingThrow = originalRollSavingThrow
                    }

                    const actorDto = new ActorValidationDTO(actor)
                    actorDto.stats.vulnerabilities = [loopVars.damageType]
                    actorDto.effects.has.push(effectName)
                    validate(actorDto, {assert})
                } else {
                    expect(
                        chatCardHelper.hasButton({
                            selector: "[data-primordial-action='roll-save']"
                        })
                    ).to.equal(false)
                    expect(
                        chatCardHelper.getMessage()?.flags?.transformations?.vulnerabilityApplied
                    ).to.equal(false)

                    const actorDto = new ActorValidationDTO(actor)
                    actorDto.stats.vulnerabilities = []
                    actorDto.effects.notHas.push(effectName)
                    validate(actorDto, {assert})
                }
            } finally {
                rollHelper.restore()
            }
        }
    }
]

const primordialChaosBehaviorTests = [
    {
        name: "Primordial Chaos triggers on a natural 1 saving throw with a regular chat message and damage roll dialog",
        uuid: PRIMORDIAL_CHAOS_UUID,
        setup: async ({staticVars}) =>
        {
            await ChatMessage.deleteDocuments(
                game.messages.contents.map(message => message.id)
            )
            setupPrimordialElementalAffinityAdvancement()
            installDamageRollDialogRenderSpy(staticVars)

            staticVars.originalDice3d = game.dice3d
            game.dice3d = {
                isEnabled()
                {
                    return false
                },
                async showForRoll() {}
            }

            const existingDamageRollDialog = findDamageRollDialog()
            if (existingDamageRollDialog) {
                await closeApplication(existingDamageRollDialog)
            }
        },
        requiredPath: buildPrimordialChaosRequiredPath(),
        steps: [
            async ({actor, runtime, waiters, staticVars}) =>
            {
                await preparePrimordialChaosMessage({
                    actor,
                    runtime,
                    waiters,
                    staticVars
                })
            }
        ],
        assertions: async ({
            waiters,
            expect,
            staticVars
        }) =>
        {
            try {
                const initialMessage = staticVars.message

                expect(initialMessage).to.exist
                expect(initialMessage.flags?.transformations).to.equal(undefined)
                expect(initialMessage.flags?.dnd5e?.item?.uuid).to.equal(
                    staticVars.chaosItem?.uuid
                )
                expect(initialMessage.flags?.dnd5e?.activity?.uuid).to.equal(
                    staticVars.chaosActivity?.uuid
                )
                expect(String(initialMessage.content ?? "")).to.not.equal("")
                expect(initialMessage.content).to.contain("Primordial Chaos")
                expect(initialMessage.content).to.not.contain(
                    "data-transformations-card"
                )

                await waiters.waitForCondition(() =>
                    queryAllIncludingShadowRoots(
                        document,
                        staticVars.messageSelector
                    ).length > 0
                )

                const messageRoot = queryAllIncludingShadowRoots(
                    document,
                    staticVars.messageSelector
                )[0] ?? null
                expect(messageRoot).to.exist

                await waiters.waitForCondition(() =>
                    staticVars.damageRollDialogRendered ||
                    findDamageRollDialog() != null ||
                    staticVars.damageRollDialogApp != null,
                {
                    errorMessage:
                        "Primordial Chaos did not open a damage roll configuration dialog"
                })

                let damageRollDialog =
                    findDamageRollDialog() ??
                    staticVars.damageRollDialogApp ??
                    null

                staticVars.damageRollDialog = damageRollDialog

                expect(damageRollDialog).to.exist

                const damageTypeOptions =
                          getDamageTypeOptionsFromDialog(damageRollDialog)

                if (damageTypeOptions.length) {
                    expect(damageTypeOptions).to.include("force")
                }

                await closeApplication(damageRollDialog)
                await waiters.waitForNextFrame()
            } finally {
                restoreDamageRollDialogRenderSpy(staticVars)
                game.dice3d = staticVars.originalDice3d
            }
        }
    },
    {
        name: "Primordial Chaos does not trigger on a non-natural-1 saving throw",
        uuid: PRIMORDIAL_CHAOS_UUID,
        setup: async ({staticVars}) =>
        {
            await ChatMessage.deleteDocuments(
                game.messages.contents.map(message => message.id)
            )
            setupPrimordialElementalAffinityAdvancement()
            installDamageRollDialogRenderSpy(staticVars)

            staticVars.originalDice3d = game.dice3d
            game.dice3d = {
                isEnabled()
                {
                    return false
                },
                async showForRoll() {}
            }

            const existingDamageRollDialog = findDamageRollDialog()
            if (existingDamageRollDialog) {
                await closeApplication(existingDamageRollDialog)
            }
        },
        requiredPath: buildPrimordialChaosRequiredPath(),
        steps: [
            async ({actor, runtime, waiters, staticVars}) =>
            {
                staticVars.chaosItem = resolvePrimordialChaosItem(actor)
                staticVars.chaosActivity = resolvePrimordialChaosActivity(
                    staticVars.chaosItem
                )
                staticVars.initialMessageIds = new Set(
                    game.messages.contents.map(message => message.id)
                )

                await runtime.services.triggerRuntime.run("savingThrow", actor, {
                    saves: {
                        current: {
                            ability: "con",
                            isSpell: true,
                            naturalRoll: 2,
                            total: 7,
                            success: false
                        }
                    }
                })

                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForNextFrame()
            }
        ],
        assertions: async ({actor, expect, staticVars}) =>
        {
            try {
                expect(findLatestPrimordialChaosMessage({
                    actor,
                    chaosItem: staticVars.chaosItem,
                    chaosActivity: staticVars.chaosActivity,
                    initialMessageIds: staticVars.initialMessageIds
                })).to.equal(null)
                expect(staticVars.damageRollDialogRendered).to.equal(false)
                expect(findDamageRollDialog()).to.equal(null)
            } finally {
                restoreDamageRollDialogRenderSpy(staticVars)
                game.dice3d = staticVars.originalDice3d
            }
        }
    }
]

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
        },
        {
            name: "stage 3 with Aura of Awakening",
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
                },
                {
                    stage: 3,
                    choose: AURA_OF_AWAKENING_UUID,
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
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            AURA_OF_AWAKENING_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ELEMENTAL_IMBALANCE_UUID
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
                    ELEMENTAL_SURGE_UUID,
                    AURA_OF_AWAKENING_UUID,
                    ELEMENTAL_IMBALANCE_UUID
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
                    item.expectedItemUuids = [AURA_OF_AWAKENING_UUID]
                    item.itemName = "Aura of Awakening"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 4
                    item.addActivity(activity =>
                    {
                        activity.name = "Select Aura"
                        activity.activationType = "longRest"
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Aura of Awakening: Light as Air"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.abilities.dex.bonuses.save",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "@abilities.con.mod",
                                priority: 20
                            }
                        ]
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Aura of Awakening: Forged in Fire"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "macro.createItem",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value:
                                    "Compendium.transformations.gh-transformations.Item.X1vRLHXV6Tt0fJGd",
                                priority: 20
                            }
                        ]
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Aura of Awakening: Heart of Stone"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "macro.createItem",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value:
                                    "Compendium.transformations.gh-transformations.Item.esO6UI1o9ZRlMn2W",
                                priority: 20
                            }
                        ]
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Aura of Awakening: Fluid Movement"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "macro.createItem",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value:
                                    "Compendium.transformations.gh-transformations.Item.oO4xDxofU22kFmfw",
                                priority: 20
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [ELEMENTAL_IMBALANCE_UUID]
                    item.itemName = "Elemental Imbalance"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 0
                    item.addActivity(activity =>
                    {
                        activity.saveAbility = ["con"]
                        activity.saveDc = 15
                        activity.range.value = 5
                        activity.range.units = "ft"
                        activity.target.prompt = false
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: (loopVars) =>
                `stage 3 with Primeval Body (${loopVars.affinityChoice.label}, ${loopVars.primevalBodyChoice.label})`,
            loop: () => primevalBodyLoopCases,
            setup: async ({actor, staticVars, loopVars}) =>
            {
                staticVars.initialCon = actor.system.abilities.con.value
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Elemental Affinity",
                        choice: loopVars.affinityChoice.uuid
                    },
                    {
                        name: "Primeval Body",
                        choice: loopVars.primevalBodyChoice.choice
                    }
                ]
            },
            steps: [
                {
                    stage: 1,
                    await: async ({runtime, actor, waiters, staticVars}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                        await waiters.waitForDomainStability({
                            actor,
                            asyncTrackers: runtime.dependencies.utils.asyncTrackers
                        })
                        await waiters.waitForCondition(() =>
                            getActorTraitValues(actor.system?.traits?.dr?.value).length > 0
                        )

                        staticVars.affinityDamageType =
                            getActorTraitValues(actor.system?.traits?.dr?.value)[0] ?? null
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
                },
                {
                    stage: 3,
                    choose: PRIMEVAL_BODY_UUID,
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
            finalAwait: async ({runtime, actor, waiters, staticVars, loopVars}) =>
            {
                const expectedTraits = buildPrimevalBodyExpectedTraits({
                    affinityDamageType: staticVars.affinityDamageType,
                    primevalDamageType: loopVars.primevalBodyChoice.damageType
                })

                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                {
                    const raceItem = actor.items.find(item => item.type === "race")
                    const resistances = getActorTraitValues(actor.system?.traits?.dr?.value)
                    const immunities = getActorTraitValues(actor.system?.traits?.di?.value)

                    return actor.system.abilities.con.value ===
                        Math.min(staticVars.initialCon + 1, 20) &&
                        raceItem?.system?.type?.subtype === "Elemental" &&
                        expectedTraits.resistances.every(type =>
                            resistances.includes(type)
                        ) &&
                        resistances.length === expectedTraits.resistances.length &&
                        expectedTraits.immunities.every(type =>
                            immunities.includes(type)
                        ) &&
                        immunities.length === expectedTraits.immunities.length &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ROILING_ELEMENTS_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ELEMENTAL_SURGE_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            PRIMEVAL_BODY_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ELEMENTAL_IMBALANCE_UUID
                        )
                })
            },
            finalAssertions: async ({actor, assert, staticVars, loopVars}) =>
            {
                const expectedTraits = buildPrimevalBodyExpectedTraits({
                    affinityDamageType: staticVars.affinityDamageType,
                    primevalDamageType: loopVars.primevalBodyChoice.damageType
                })
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    PLANAR_BINDING_UUID,
                    PRIMORDIAL_FORM_UUID,
                    ELEMENTAL_AFFINITY_UUID,
                    loopVars.affinityChoice.uuid,
                    ROILING_ELEMENTS_UUID,
                    ELEMENTAL_SURGE_UUID,
                    PRIMEVAL_BODY_UUID,
                    ELEMENTAL_IMBALANCE_UUID
                ]
                actorDto.abilities.con.value =
                    Math.min(staticVars.initialCon + 1, 20)
                actorDto.stats.resistances = expectedTraits.resistances
                actorDto.stats.immunities = expectedTraits.immunities
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
                    item.expectedItemUuids = [PRIMEVAL_BODY_UUID]
                    item.itemName = "Primeval Body"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 0
                    item.numberOfEffects = 0
                    item.addAdvancement(advancement =>
                    {
                        advancement.addConfiguration(configuration =>
                        {
                            configuration.choices = [
                                {
                                    count: 1,
                                    pool: [
                                        "dr:bludgeoning",
                                        "dr:cold",
                                        "dr:fire",
                                        "dr:lightning"
                                    ]
                                }
                            ]
                        })
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [ELEMENTAL_IMBALANCE_UUID]
                    item.itemName = "Elemental Imbalance"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 0
                    item.addActivity(activity =>
                    {
                        activity.saveAbility = ["con"]
                        activity.saveDc = 15
                        activity.range.value = 5
                        activity.range.units = "ft"
                        activity.target.prompt = false
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 3 with Master of Many",
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
                    },
                    {
                        name: "Master of Many",
                        choice: THIRD_ELEMENTAL_AFFINITY_CHOICE_UUID
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
                },
                {
                    stage: 3,
                    choose: MASTER_OF_MANY_UUID,
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
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            MASTER_OF_MANY_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            THIRD_ELEMENTAL_AFFINITY_CHOICE_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ELEMENTAL_IMBALANCE_UUID
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
                    SECOND_ELEMENTAL_AFFINITY_CHOICE_UUID,
                    MASTER_OF_MANY_UUID,
                    THIRD_ELEMENTAL_AFFINITY_CHOICE_UUID,
                    ELEMENTAL_IMBALANCE_UUID
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
                    item.expectedItemUuids = [MASTER_OF_MANY_UUID]
                    item.itemName = "Master of Many"
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
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [ELEMENTAL_IMBALANCE_UUID]
                    item.itemName = "Elemental Imbalance"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 0
                    item.addActivity(activity =>
                    {
                        activity.saveAbility = ["con"]
                        activity.saveDc = 15
                        activity.range.value = 5
                        activity.range.units = "ft"
                        activity.target.prompt = false
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 4 with Primordial Aura and Primordial Chaos",
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
                },
                {
                    stage: 3,
                    choose: AURA_OF_AWAKENING_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            3
                        )
                    }
                },
                {
                    stage: 4,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            4
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
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            AURA_OF_AWAKENING_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ELEMENTAL_IMBALANCE_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            PRIMORDIAL_CHAOS_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            PRIMORDIAL_AURA_UUID
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
                    ELEMENTAL_SURGE_UUID,
                    AURA_OF_AWAKENING_UUID,
                    ELEMENTAL_IMBALANCE_UUID,
                    PRIMORDIAL_CHAOS_UUID,
                    PRIMORDIAL_AURA_UUID
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
                    item.expectedItemUuids = [PRIMORDIAL_AURA_UUID]
                    item.itemName = "Primordial Aura"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 4
                    item.addActivity(activity =>
                    {
                        activity.name = "Grant damage resistance"
                        activity.activationType = "bonus"
                        activity.range.value = 15
                        activity.range.units = "ft"
                        activity.target.affects.type = "creature"
                        activity.target.prompt = true
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Primordial Aura: Bludgeoning"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "macro.itemMacro",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value: "bludgeoning",
                                priority: 20
                            }
                        ]
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Primordial Aura: Cold"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "macro.itemMacro",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value: "cold",
                                priority: 20
                            }
                        ]
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Primordial Aura: Fire"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "macro.itemMacro",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value: "fire",
                                priority: 20
                            }
                        ]
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Primordial Aura: Lightning"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "macro.itemMacro",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value: "lightning",
                                priority: 20
                            }
                        ]
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [PRIMORDIAL_CHAOS_UUID]
                    item.itemName = "Primordial Chaos"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 0
                    item.addActivity(activity =>
                    {
                        activity.activationType = "special"
                        activity.range.units = "self"
                        activity.target.affects.type = "self"
                        activity.target.prompt = false
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.roll = "8d6"
                            damagePart.bonus = ""
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["force"]
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: "stage 4 with Elemental Mastery",
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
                    },
                    {
                        name: "Master of Many",
                        choice: THIRD_ELEMENTAL_AFFINITY_CHOICE_UUID
                    },
                    {
                        name: "Elemental Mastery",
                        choice: FOURTH_ELEMENTAL_AFFINITY_CHOICE_UUID
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
                },
                {
                    stage: 3,
                    choose: MASTER_OF_MANY_UUID,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            3
                        )
                    }
                },
                {
                    stage: 4,
                    await: async ({runtime, actor, waiters}) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            4
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
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            MASTER_OF_MANY_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            THIRD_ELEMENTAL_AFFINITY_CHOICE_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ELEMENTAL_IMBALANCE_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            PRIMORDIAL_CHAOS_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            ELEMENTAL_MASTERY_UUID
                        ) &&
                        actor.items.some(item =>
                            item.flags?.transformations?.sourceUuid ===
                            FOURTH_ELEMENTAL_AFFINITY_CHOICE_UUID
                        )
                })
            },
            finalAssertions: async ({actor, assert, staticVars}) =>
            {
                const actorConMod = actor.system.abilities.con.mod
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    PLANAR_BINDING_UUID,
                    PRIMORDIAL_FORM_UUID,
                    ELEMENTAL_AFFINITY_UUID,
                    ELEMENTAL_AFFINITY_CHOICE_UUID,
                    ROILING_ELEMENTS_UUID,
                    DUAL_NATURE_UUID,
                    SECOND_ELEMENTAL_AFFINITY_CHOICE_UUID,
                    MASTER_OF_MANY_UUID,
                    THIRD_ELEMENTAL_AFFINITY_CHOICE_UUID,
                    ELEMENTAL_IMBALANCE_UUID,
                    PRIMORDIAL_CHAOS_UUID,
                    ELEMENTAL_MASTERY_UUID,
                    FOURTH_ELEMENTAL_AFFINITY_CHOICE_UUID
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
                    item.expectedItemUuids = [ELEMENTAL_MASTERY_UUID]
                    item.itemName = "Elemental Mastery"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 4
                    item.uses.max = actorConMod
                    item.uses.addRecovery(recovery =>
                    {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
                    item.addAdvancement(advancement =>
                    {
                        advancement.addConfiguration(() => {})
                    })
                    item.addActivity(activity =>
                    {
                        activity.name = "Damage"
                        activity.activationType = "reaction"
                        activity.saveAbility = ["dex"]
                        activity.range.units = "self"
                        activity.target.affects.type = "creature"
                        activity.target.affects.count = "1"
                        activity.target.prompt = false
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.roll = "6d6"
                            damagePart.bonus = ""
                            damagePart.numberOfTypes = 4
                            damagePart.damageTypes = [
                                "bludgeoning",
                                "cold",
                                "fire",
                                "lightning"
                            ]
                        })
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Elemental Mastery: Air"
                        effect.changes.count = 2
                        effect.changes = [
                            {
                                key: "flags.midi-qol.advantage.attack.rwak",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "1",
                                priority: 20
                            },
                            {
                                key: "flags.midi-qol.advantage.attack.rsak",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "1",
                                priority: 20
                            }
                        ]
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Elemental Mastery: Earth"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "macro.createItem",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value:
                                    "Compendium.transformations.gh-transformations.Item.U1W6fCAmzOKBRmD5",
                                priority: 20
                            }
                        ]
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Elemental Mastery: Fire"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "macro.createItem",
                                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                                value:
                                    "Compendium.transformations.gh-transformations.Item.ZNeHpSQXylLEUtN0",
                                priority: 20
                            }
                        ]
                    })
                    item.addEffect(effect =>
                    {
                        effect.name = "Elemental Mastery: Water"
                        effect.changes.count = 0
                    })
                })
                actorDto.addItem(item =>
                {
                    item.expectedItemUuids = [PRIMORDIAL_CHAOS_UUID]
                    item.itemName = "Primordial Chaos"
                    item.type = "feat"
                    item.systemType = "transformation"
                    item.systemSubType = "primordial"
                    item.numberOfActivities = 1
                    item.numberOfEffects = 0
                    item.addActivity(activity =>
                    {
                        activity.activationType = "special"
                        activity.range.units = "self"
                        activity.target.affects.type = "self"
                        activity.target.prompt = false
                        activity.addDamagePart(damagePart =>
                        {
                            damagePart.roll = "8d6"
                            damagePart.bonus = ""
                            damagePart.numberOfTypes = 1
                            damagePart.damageTypes = ["force"]
                        })
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
        ...roilingElementsSavingThrowCases,
        ...elementalImbalanceBehaviorTests,
        ...primordialChaosBehaviorTests
    ]
}
