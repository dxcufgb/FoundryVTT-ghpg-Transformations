import { validate } from "../../../helpers/DTOValidators/validate.js"
import { ActorValidationDTO } from "../../../helpers/validationDTOs/actor/ActorValidationDTO.js"
import { EffectValidationDTO } from "../../../helpers/validationDTOs/effect/EffectValidationDTO.js"
import { giftsOfDamnation } from "../../../../domain/transformation/subclasses/fiend/giftsOfDamnation/index.js";
import { findTransformationGeneralChoiceButtonById, findTransformationGeneralChoiceDialog, getTransformationGeneralChoiceDialogWindowTitle } from "../../../selectors/transformationGeneralChoiceDialog.finders.js"
import { SKILL } from "../../../../config/constants.js";
import { RollService } from "../../../../services/rolls/RollService.js"

function allowMockRollMessageUpdates(message)
{
    let latestRolls = null

    const getRelatedMessages = () =>
        [
            message,
            game.messages?.get(message?.id)
        ]
        .filter(Boolean)
        .filter((candidate, index, collection) =>
            collection.findIndex(entry => entry === candidate) === index
        )

    function applyRolls(rolls)
    {
        latestRolls = rolls

        for (const currentMessage of getRelatedMessages()) {
            Object.defineProperty(currentMessage, "rolls", {
                configurable: true,
                enumerable: true,
                writable: true,
                value: rolls
            })
        }
    }

    function patchMessage(currentMessage)
    {
        if (!currentMessage || currentMessage.__mockRollsEnabled) {
            if (currentMessage && Array.isArray(latestRolls)) {
                applyRolls(latestRolls)
            }
            return
        }

        const originalUpdate = currentMessage.update.bind(currentMessage)

        Object.defineProperty(currentMessage, "__mockRollsEnabled", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: true
        })

        if (Array.isArray(latestRolls)) {
            applyRolls(latestRolls)
        }

        currentMessage.update = async function update(data = {}, ...args)
        {
            if (Array.isArray(data?.rolls)) {
                const {rolls, ...remaining} = data

                applyRolls(rolls)

                if (Object.keys(remaining).length === 0) {
                    return this
                }

                const result = await originalUpdate(remaining, ...args)
                applyRolls(rolls)
                patchMessage(game.messages?.get(message?.id))
                return result
            }

            const result = await originalUpdate(data, ...args)
            patchMessage(game.messages?.get(message?.id))
            return result
        }
    }

    for (const currentMessage of getRelatedMessages()) {
        patchMessage(currentMessage)
    }
}

function setFiendStage1DamageResistanceChoice()
{
    globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
        {
            name: "Fiendish Soul",
            choice: {
                icon: "modules/transformations/icons/damageTypes/Acid.png",
                id: "acid",
                label: "Acid",
                raw: "dr:acid",
                value: "acid"
            }
        }
    ]
}

async function applyHidingFiendAppearance({
    actor,
    helpers
})
{
    await helpers.applyItemActivityEffect({
        actor,
        itemName: "Fiend Form",
        effectName: "Hiding Fiend Appearance",
        macroTrigger: "on"
    })
}

async function applyGiftOfUnfetteredGloryAndTriggerHitDie({
    actor,
    runtime,
    waiters,
    staticVars
})
{
    staticVars.context = {
        rolls: [
            {
                parts: [
                    "1d8"
                ]
            }
        ]
    }

    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnfetteredGlory")
    await runtime.services.applyFiendGiftOfDamnation({
        actor,
        gift
    })

    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
    await waiters.waitForNextFrame()
    await waiters.waitForCondition(() =>
        actor.items.some(i => i.name === "Gift of Unfettered Glory")
    )

    await actor.update({
        "system.attributes.hp.value": 1
    })

    const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
    transformation.TransformationClass.onPreRollHitDie(staticVars.context, actor)
}

async function setFiendStage3GiftChoices(actor)
{
    await actor.update({
        "flags.transformations.stageChoices": {
            "fiend": {
                1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                2: "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL"
            }
        }
    })
    setFiendStage1DamageResistanceChoice()
}

async function prepareFiendGiftChatCard({
    actor,
    runtime,
    helpers,
    waiters,
    staticVars,
    giftId,
    itemName
})
{
    let activityUseResult = null

    const messageContainsGiftCard = message =>
        String(message?.content ?? "").includes(`data-gift="${giftId}"`)
    const getReturnedMessages = () =>
        [
            activityUseResult?.message,
            activityUseResult?.chatMessage,
            activityUseResult?.changes?.message,
            activityUseResult?.usage?.message,
            activityUseResult?.usage?.chatMessage,
            activityUseResult?.workflow?.message,
            activityUseResult?.workflow?.chatMessage
        ]
        .map(message =>
            message?.id
                ? game.messages?.get(message.id) ?? message
                : message
        )
        .filter(Boolean)
        .filter((message, index, collection) =>
            collection.findIndex(entry => entry?.id === message?.id) === index
        )
    const getNewMessages = () =>
        game.messages.contents.filter(message =>
            !staticVars.initialMessageIds.has(message.id)
        )
    const findNewestMatchingMessage = predicate =>
        [...getNewMessages()].reverse().find(predicate) ?? null
    const findReturnedMessage = predicate =>
        [...getReturnedMessages()].reverse().find(predicate) ?? null
    const findActivityMessage = () =>
        findReturnedMessage(() => true) ??
        findNewestMatchingMessage(message =>
            message?.flags?.dnd5e?.activity?.uuid === activity?.uuid
        ) ??
        findNewestMatchingMessage(message =>
            message?.flags?.dnd5e?.item?.uuid === giftItem?.uuid
        ) ??
        findNewestMatchingMessage(message =>
            message?.speaker?.actor === actor.id &&
            message?.flags?.dnd5e?.activity
        )
    const findGiftMessage = () =>
        findReturnedMessage(messageContainsGiftCard) ??
        findReturnedMessage(message =>
            message?.flags?.transformations?.gift === giftId
        ) ??
        findNewestMatchingMessage(messageContainsGiftCard) ??
        findNewestMatchingMessage(message =>
            message?.flags?.transformations?.gift === giftId
        )

    const gift = giftsOfDamnation.find(entry => entry.id === giftId)
    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
    await waiters.waitForNextFrame()
    await waiters.waitForCondition(() =>
        actor.items.some(i => i.name === itemName)
    )

    const giftItem = actor.items.find(i => i.name === itemName)
    const activity = giftItem.system.activities.find(a => a.name === itemName)
    staticVars.initialMessageCount = game.messages.contents.length
    staticVars.initialMessageIds = new Set(
        game.messages.contents.map(message => message.id)
    )
    activityUseResult = await activity.use({actor})

    await waiters.waitForCondition(() =>
        game.messages.contents.length > staticVars.initialMessageCount ||
        getReturnedMessages().length > 0 ||
        Boolean(findActivityMessage())
    )
    await waiters.waitForNextFrame()

    staticVars.message =
        findGiftMessage() ??
        findActivityMessage() ??
        game.messages.contents.at(-1)

    allowMockRollMessageUpdates(staticVars.message)
    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
        message: staticVars.message
    })

    try {
        await staticVars.chatCardHelper.waitForCard({
            timeout: 5000
        })
    } catch {
        await gift?.GiftClass?.giftActivity?.({
            actor,
            message: staticVars.message,
            actorRepository: runtime.infrastructure.actorRepository,
            ChatMessagePartInjector: runtime.ui.ChatMessagePartInjector
        })

        staticVars.message = game.messages.get(staticVars.message.id) ?? staticVars.message
        allowMockRollMessageUpdates(staticVars.message)
        staticVars.chatCardHelper = helpers.createChatCardTestHelper({
            message: staticVars.message
        })
        await waiters.waitForNextFrame()
    }
}

const FIEND_STAGE_4_CHOICE_UUID =
          "Compendium.transformations.gh-transformations.Item.IEyyfet4TphAPoVB"

async function createCharacterClassWithHitDice({
    actor,
    helpers,
    className,
    hitDiceValue,
    hitDiceMax = hitDiceValue,
    levels = 1
})
{
    const foundCharacterClass = await helpers.getCharacterClass(className)
    const classItem = await helpers.createActorItemAndWait(
        actor,
        foundCharacterClass,
        {
            setTransformationFlags: false,
            setDdbImporterFlag: false,
            applyAdvancements: false,
            levels: levels
        }
    )

    await classItem.update({
        "system.hd.value": hitDiceValue,
        "system.hd.max": hitDiceMax,
        "system.hd.spent": Math.max(hitDiceMax - hitDiceValue, 0)
    })

    return actor.items.get(classItem.id) ?? classItem
}

function createGiftTestChatMessage(actor, {
    content = `<div class="midi-dnd5e-buttons"></div>`
} = {})
{
    return {
        id: foundry.utils.randomID(),
        content,
        flags: {},
        rolls: [],
        speaker: {
            actor: actor?.id ?? null,
            alias: actor?.name ?? null
        },
        async update(data = {})
        {
            const expanded = foundry.utils.expandObject(data)
            foundry.utils.mergeObject(this, expanded, {
                inplace: true,
                overwrite: true,
                insertKeys: true,
                insertValues: true
            })
            return this
        }
    }
}

function getClassItemsSortedByHitDie(actor)
{
    return [...(actor?.items?.filter(item => item.type === "class") ?? [])]
    .sort((left, right) =>
        Number.parseInt(
            String(right.system?.hd?.denomination ?? "d0").replace("d", "")
        ) -
        Number.parseInt(
            String(left.system?.hd?.denomination ?? "d0").replace("d", "")
        )
    )
}

function createUnbridledPowerTestActorRepository()
{
    return {
        getHighestAvailableHitDice(actor)
        {
            return getClassItemsSortedByHitDie(actor)
            .map(item => ({
                denomination: item.system?.hd?.denomination ?? null,
                value: Math.max(Number(item.system?.hd?.value ?? 0), 0),
                spent: Math.max(Number(item.system?.hd?.spent ?? 0), 0),
                max: Math.max(Number(item.system?.hd?.max ?? 0), 0)
            }))
            .find(entry =>
                Boolean(entry.denomination) && entry.value > 0
            ) ?? null
        },

        getAvailableHitDice(actor)
        {
            return getClassItemsSortedByHitDie(actor)
            .reduce(
                (total, item) =>
                    total + Math.max(Number(item.system?.hd?.value ?? 0), 0),
                0
            )
        },

        async consumeHitDie(actor, amount)
        {
            let remainingToConsume = Math.max(Number(amount ?? 0), 0)

            for (const classItem of getClassItemsSortedByHitDie(actor)) {
                if (remainingToConsume <= 0) break

                const currentValue = Math.max(
                    Number(classItem.system?.hd?.value ?? 0),
                    0
                )
                if (currentValue <= 0) continue

                const spend = Math.min(currentValue, remainingToConsume)
                const currentSpent = Math.max(
                    Number(classItem.system?.hd?.spent ?? 0),
                    0
                )

                remainingToConsume -= spend

                await classItem.update({
                    "system.hd.value": currentValue - spend,
                    "system.hd.spent": currentSpent + spend
                })
            }
        },

        async applyDamage(actor, amount)
        {
            const currentHp = Math.max(
                Number(actor.system?.attributes?.hp?.value ?? 0),
                0
            )

            await actor.update({
                "system.attributes.hp.value": Math.max(
                    currentHp - Number(amount ?? 0),
                    0
                )
            })
        }
    }
}

async function prepareFiendGiftClassChatCard({
    actor,
    runtime,
    helpers,
    waiters,
    staticVars,
    giftId,
    itemName
})
{
    const gift = giftsOfDamnation.find(entry => entry.id === giftId)
    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
    await waiters.waitForNextFrame()
    await waiters.waitForCondition(() =>
        actor.items.some(i => i.name === itemName)
    )

    staticVars.message = createGiftTestChatMessage(actor)

    await gift?.GiftClass?.giftActivity?.({
        actor,
        message: staticVars.message,
        actorRepository: runtime.infrastructure.actorRepository,
        ChatMessagePartInjector: runtime.ui.ChatMessagePartInjector
    })

    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
        message: staticVars.message
    })
}

async function prepareFiendUnbridledPowerClassChatCard({
    actor,
    runtime,
    helpers,
    waiters,
    staticVars
})
{
    const gift = giftsOfDamnation.find(entry =>
        entry.id === "giftOfUnbridledPower"
    )

    await runtime.services.applyFiendGiftOfDamnation({
        actor,
        gift
    })

    await waiters.waitForDomainStability({
        actor,
        asyncTrackers: runtime.dependencies.utils.asyncTrackers
    })
    await waiters.waitForNextFrame()
    await waiters.waitForCondition(() =>
        actor.items.some(item => item.name === "Gift of Unbridled Power")
    )

    staticVars.unbridledPowerGiftClass = gift?.GiftClass ?? null
    staticVars.unbridledPowerActorRepository =
        createUnbridledPowerTestActorRepository()
    staticVars.message = createGiftTestChatMessage(actor)

    allowMockRollMessageUpdates(staticVars.message)

    await staticVars.unbridledPowerGiftClass?.giftActivity?.({
        actor,
        message: staticVars.message,
        actorRepository: staticVars.unbridledPowerActorRepository,
        ChatMessagePartInjector: runtime.ui.ChatMessagePartInjector
    })

    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
        message: staticVars.message
    })
}

async function waitForWindowByTitle({
    waiters,
    title
})
{
    await waiters.waitForCondition(() =>
        Array.from(ui.windows.values()).some(window =>
            window?.title === title
        )
    )
    await waiters.waitForNextFrame()

    return Array.from(ui.windows.values()).find(window =>
        window?.title === title
    ) ?? null
}

function getApplicationRoot(application)
{
    return application?.element?.[0] ?? application?.element ?? null
}

function findSpellSlotLevelGroup(root, level)
{
    return Array.from(
        root?.querySelectorAll?.("[data-slot-group]") ?? []
    ).find(group =>
        group.querySelector("[data-slot-option]")?.dataset?.slotLevel ===
        String(level)
    ) ?? null
}

function getSpellSlotCheckboxes(group)
{
    return Array.from(group?.querySelectorAll?.("[data-slot-option]") ?? [])
}

export const fiendTestDef = {
    id: "fiend",
    rollTableOrigin: "NA",
    scenarios: [
        {
            name: (loopVars) => `stage 1 with Devilish Contractor and ${loopVars.damageType} resistance`,
            loop: () => [
                {damageType: "acid"},
                {damageType: "cold"},
                {damageType: "fire"}
            ],
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: loopVars.damageType
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                ]
                actorDto.addItem(item =>
                {
                    item.type = "race"
                    item.systemType = "humanoid"
                    item.systemSubType = "Fiend"
                })
                actorDto.addItem(item => {
                    item.itemName = "Devilish Contractor"
                    item.addActivity(activity => {
                        activity.name = "Devilish Contractor"
                        activity.activationType = "action"
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "Fiend Bound"
                    item.addEffect(effect => {
                        effect.name = "Fiend Bound"
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
                actorDto.addItem(item => {
                    item.itemName = "Fiendish Soul"
                    item.addEffect(effect => {
                        effect.name = "Fiendish Deception"
                        effect.changes.count = 1
                        effect.changes = [
                            {
                                key: "system.skills.dec.roll.mode",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: 1
                            }
                        ]
                    })
                })
                actorDto.stats.resistances.push(loopVars.damageType)
                validate(actorDto, {assert})
            }
        },
        {
            name: (loopVars) => `stage 1 with Infernal Smite and ${loopVars.damageType} resistance`,
            loop: () => [
                {damageType: "acid"},
                {damageType: "cold"},
                {damageType: "fire"}
            ],
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.J8kBOzgYeNfUolan",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: loopVars.damageType
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorProf = actor.system.attributes.prof

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.J8kBOzgYeNfUolan"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Infernal Smite"
                    item.uses.max = actorProf + 1
                    item.uses.value = actorProf + 1
                    item.usesLeft = actorProf + 1
                    item.uses.addRecovery(recovery => {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
                    item.addActivity(activity => {
                        activity.name = "Midi Damage"
                        activity.activityType = "special"
                        activity.consumption.addTarget(target => {
                            target.type = "itemUses"
                            target.value = 1
                        })
                        activity.range.units = "spec"
                        activity.addDamagePart(damagePart => {
                            damagePart.custom = "(@flags.transformations.stage)d6"
                            damagePart.numbberOfTypes = 1
                            damagePart.type = loopVars.damageType
                        })
                    })
                })
                actorDto.stats.resistances.push(loopVars.damageType)
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Enhanced Contract`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Enhanced Contract"
                    item.uses.max = 1
                    item.uses.value = 1
                    item.usesLeft = 1
                    item.uses.addRecovery(recovery => {
                        recovery.period = "lr"
                        recovery.type = "recoverAll"
                    })
                    item.uses.addRecovery(recovery => {
                        recovery.period = "sr"
                        recovery.type = "recoverAll"
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Daemonic Brand as choice`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorProf = actor.system.attributes.prof

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Daemonic Brand"
                    item.uses.max = actorProf
                    item.uses.addRecovery(recovery => {
                        recovery.type = "recoverAll"
                        recovery.period = "lr"
                    })
                    item.addActivity(activity => {
                        activity.name = "Midi Save"
                        activity.activationType = "bonus"
                        activity.duration.value = 1
                        activity.duration.units = "minute"
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.type = "item"
                                target.value = 1
                            })
                        })
                        activity.range.value = 60
                        activity.range.unit = "ft"
                        activity.target.value = 1
                        activity.target.type = "creature"
                        activity.saveAbility = ["wis"]
                        activity.saveDc = (8 + actorProf + 2)
                        activity.addEffect(effect => {
                            effect.name = "Daemonic Brand Saving Throw Penalty"
                            effect.description = "The creature takes a –2 penalty on all saving throws."
                            effect.duration.duration = 60
                            effect.duration.rounds = 10
                            effect.duration.seconds = 60
                            effect.changes.count = 6
                            effect.changes = [
                                {
                                    key: "system.abillities.cha.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                },
                                {
                                    key: "system.abillities.con.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                },
                                {
                                    key: "system.abillities.dex.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                },
                                {
                                    key: "system.abillities.int.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                },
                                {
                                    key: "system.abillities.str.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                },
                                {
                                    key: "system.abillities.wis.bonuses.save",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -2
                                }
                            ]
                        })
                        activity.addEffect(effect => {
                            effect.name = "Daemonic Brand Attack Vulnerability"
                            effect.description = "The first attack against the creature on each turn is made with Advantage."
                            effect.duration.duration = 60
                            effect.duration.rounds = 10
                            effect.duration.seconds = 60
                        })
                        activity.addEffect(effect => {
                            effect.name = "Daemonic Brand Damaged Vitality"
                            effect.description = "The creature cannot regain Hit Points."
                            effect.duration.duration = 60
                            effect.duration.rounds = 10
                            effect.duration.seconds = 60
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 2 with Daemonic Brand as default choice`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.J8kBOzgYeNfUolan",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorProf = actor.system.attributes.prof

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.J8kBOzgYeNfUolan",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL"
                ]
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Devilish subcontractor`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM",
                    "Compendium.transformations.gh-transformations.Item.1DPOphqvUFg1Yzfm",
                    "Compendium.transformations.gh-transformations.Item.p6h58Xog87H04epW"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Devilish Subcontractor"
                })
                actorDto.addItem(item => {
                    item.itemName = "Pull of the Netherworld"
                    item.uses.max = 1
                    item.uses.addRecovery(recovery => {
                        recovery.type = "recoverAll"
                        recovery.period = "lr"
                    })
                    item.uses.addRecovery(recovery => {
                        recovery.type = "recoverAll"
                        recovery.period = "sr"
                    })
                    item.addActivity(activity => {
                        activity.name = "Midi Damage"
                        activity.addConsumption(consumption => {
                            consumption.numberOfTargets = 1
                            consumption.addTarget(target => {
                                target.type = "item"
                                target.value = 1
                            })
                        })
                    })
                })
                actorDto.stats.resistances.push("acid")
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Overwhelming Brand as choice`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorProf = actor.system.attributes.prof

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    "Compendium.transformations.gh-transformations.Item.p6h58Xog87H04epW",
                    "Compendium.transformations.gh-transformations.Item.0npAmRAQjFWFpL6x"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Overwhelming Brand"
                    item.addActivity(activity => {
                        activity.name = "Halting Brand"
                        activity.activationType = ""
                        activity.target.value = 1
                        activity.target.type = "creature"
                        activity.addEffect(effect => {
                            effect.name = "Halting Brand"
                            effect.description = "Your speed is halved. The fiend who branded you may move you 10 feet horizontally on their turn without using an action."
                            effect.duration.duration = 60
                            effect.duration.rounds = 10
                            effect.duration.seconds = 60
                            effect.changes.count = 0
                        })
                    })
                    item.addActivity(activity => {
                        activity.name = "Blinding Brand"
                        activity.activationType = ""
                        activity.target.value = 1
                        activity.target.type = "creature"
                        activity.addEffect(effect => {
                            effect.name = "Blinding Brand"
                            effect.description = "You are blinded."
                            effect.statuses = ["blinded"]
                            effect.duration.duration = 60
                            effect.duration.rounds = 10
                            effect.duration.seconds = 60
                            effect.changes.count = 0
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: (loopVars) => `stage 4 with Abyssal Resistance as choice and ${loopVars.damageType} resistance on Fiendish Soul`,
            loop: () => [
                {damageType: "acid"},
                {damageType: "cold"},
                {damageType: "fire"}
            ],
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: loopVars.damageType
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.1jj1O2nBZDfUs5aL",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const damageTypes = ["acid", "cold", "fire"]
                const immunityType = damageTypes.find(t => t == loopVars.damageType)
                const resistanceTypes = damageTypes.filter(t => t != loopVars.damageType)

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    "Compendium.transformations.gh-transformations.Item.p6h58Xog87H04epW",
                    "Compendium.transformations.gh-transformations.Item.0npAmRAQjFWFpL6x",
                    "Compendium.transformations.gh-transformations.Item.1jj1O2nBZDfUs5aL",
                    "Compendium.transformations.gh-transformations.Item.9Ptls1PSiuOtg7cY"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Abyssal Resistance"
                    item.addEffect(effect => {
                        effect.name = "Abyssal Resistance"
                        effect.description = `You have immunity to ${immunityType}, resistance to ${resistanceTypes.join(
                            ", ")} and resistance to damage from nonmagical weapon attacks or Unarmed Strikes.`
                        effect.changes = [
                            {
                                key: "system.traits.dr.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: resistanceTypes[0]
                            },
                            {
                                key: "system.traits.dr.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: resistanceTypes[1]
                            },
                            {
                                key: "system.traits.di.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: immunityType
                            },
                            {
                                key: "system.traits.dr.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "Bludgeoning"
                            },
                            {
                                key: "system.traits.dr.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "Piercing"
                            },
                            {
                                key: "system.traits.dr.value",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "Slashing"
                            },
                            {
                                key: "system.traits.dr.bypass",
                                mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                value: "Magical"
                            }
                        ]
                    })
                })
                actorDto.addItem(item => {
                    item.itemName = "True Name"
                    item.addActivity(activity => {
                        activity.name = "Midi Save"
                        activity.saveDc = 20
                        activity.addEffect(effect => {
                            effect.name = "Controlled by True Name"
                            effect.changes = [
                                {
                                    key: "system.abilities.cha.save.roll.mode",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -1
                                },
                                {
                                    key: "system.abilities.con.save.roll.mode",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -1
                                },
                                {
                                    key: "system.abilities.dex.save.roll.mode",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -1
                                },
                                {
                                    key: "system.abilities.int.save.roll.mode",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -1
                                },
                                {
                                    key: "system.abilities.str.save.roll.mode",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -1
                                },
                                {
                                    key: "system.abilities.wis.save.roll.mode",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    value: -1
                                }
                            ]
                        })
                    })
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 4 with Infernal Summons`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.IEyyfet4TphAPoVB",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const damageTypes = ["acid", "cold", "fire"]

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    "Compendium.transformations.gh-transformations.Item.p6h58Xog87H04epW",
                    "Compendium.transformations.gh-transformations.Item.0npAmRAQjFWFpL6x",
                    "Compendium.transformations.gh-transformations.Item.IEyyfet4TphAPoVB"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Infernal Summons"
                })
                validate(actorDto, {assert})
            }
        },
        {
            name: `stage 3 with Overwhelming Brand as choice`,
            steps: [
                {
                    stage: 1,
                    choose: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await helpers.fiend.chooseDamageResistanceOnStage1({
                            waiters,
                            runtime,
                            actor,
                            choice: "acid"
                        })
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }
                },
                {
                    stage: 3,
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.wb4MknhF2jQdamhM",
                    await: async ({runtime, actor, waiters, helpers, loopVars}) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({actor, assert, loopVars, validators}) =>
            {
                const actorProf = actor.system.attributes.prof

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemWithSourceUuids = [
                    "Compendium.transformations.gh-transformations.Item.0GwDDz0VsTEFnHsn",
                    "Compendium.transformations.gh-transformations.Item.kCaxPcrf3l64RMrU",
                    "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                    "Compendium.transformations.gh-transformations.Item.nCsHUZkM8p26at19",
                    "Compendium.transformations.gh-transformations.Item.WEFrREhcN84F6ehL",
                    "Compendium.transformations.gh-transformations.Item.p6h58Xog87H04epW",
                    "Compendium.transformations.gh-transformations.Item.0npAmRAQjFWFpL6x",
                    "Compendium.transformations.gh-transformations.Item.wb4MknhF2jQdamhM"
                ]
                actorDto.addItem(item => {
                    item.itemName = "Ultimate Brand"
                })
                validate(actorDto, {assert})
            }
        }
    ],

    itemBehaviorTests: [
        {
            name: `Gift of Joyous Life, save Success`,

            setup: async ({actor}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    staticVars.initialMessageCount = game.messages.contents.length
                    await actor.update({
                        "system.attributes.hp.value": (actor.system.attributes.hp.max / 2) - 1
                    })
                    staticVars.initialHp = actor.system.attributes.hp.value

                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfJoyousLife")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Joyous Life")
                    )
                    const giftOfJoyousLife = actor.items.find(i => i.name == "Gift of Joyous Life")
                    const activity = giftOfJoyousLife.system.activities.find(a => a.name == "Gift of Joyous Life")
                    await activity.use({actor})

                    await waiters.waitForCondition(() =>
                        game.messages.contents.length > staticVars.initialMessageCount
                    )

                    staticVars.message = game.messages.contents.at(-1)
                    allowMockRollMessageUpdates(staticVars.message)
                    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
                        message: staticVars.message
                    })
                }
            ],

            await: async ({
                waiters,
                staticVars
            }) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll Hit Die"
                })
            },

            assertions: async ({actor, expect, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Joyous Life chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfJoyousLife")

                    chatCardHelper.assertButtonExists({
                        text: "Roll Hit Die"
                    }, expect)

                    rollHelper.queueRoll({
                        total: 2
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll Hit Die"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    expect(
                        rollHelper.getCalls().some(call => call.type === "roll"),
                        "Clicking Roll Hit Die should invoke Roll.roll()"
                    ).to.equal(true)

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.total).to.equal(2)

                    await chatCardHelper.waitForButton({
                        text: "Apply Healing"
                    })

                    chatCardHelper.assertButtonExists({
                        text: "Apply Healing"
                    }, expect)

                    await chatCardHelper.clickButton({
                        text: "Apply Healing"
                    })

                    await waiters.waitForCondition(() =>
                        actor.system.attributes.hp.value === staticVars.initialHp + 2
                    )

                    expect(actor.system.attributes.hp.value).to.equal(staticVars.initialHp + 2)
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Joyous Life, save fail`,

            setup: async ({actor}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    staticVars.initialMessageCount = game.messages.contents.length
                    await actor.update({
                        "system.attributes.hp.value": (actor.system.attributes.hp.max / 2) - 1
                    })
                    staticVars.initialHp = actor.system.attributes.hp.value

                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfJoyousLife")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Joyous Life")
                    )
                    const giftOfJoyousLife = actor.items.find(i => i.name == "Gift of Joyous Life")
                    const activity = giftOfJoyousLife.system.activities.find(a => a.name == "Gift of Joyous Life")
                    await activity.use({actor})

                    await waiters.waitForCondition(() =>
                        game.messages.contents.length > staticVars.initialMessageCount
                    )

                    staticVars.message = game.messages.contents.at(-1)
                    allowMockRollMessageUpdates(staticVars.message)
                    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
                        message: staticVars.message
                    })
                }
            ],

            await: async ({
                waiters,
                staticVars
            }) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll Hit Die"
                })
            },

            assertions: async ({actor, expect, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Joyous Life chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfJoyousLife")

                    chatCardHelper.assertButtonExists({
                        text: "Roll Hit Die"
                    }, expect)

                    rollHelper.queueRoll({
                        total: 1
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll Hit Die"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    expect(
                        rollHelper.getCalls().some(call => call.type === "roll"),
                        "Clicking Roll Hit Die should invoke Roll.roll()"
                    ).to.equal(true)

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.total).to.equal(1)

                    await chatCardHelper.waitForButton({
                        text: "Apply Damage"
                    })

                    chatCardHelper.assertButtonExists({
                        text: "Apply Damage"
                    }, expect)

                    await chatCardHelper.clickButton({
                        text: "Apply Damage"
                    })

                    await waiters.waitForCondition(() =>
                        actor.system.attributes.hp.value === staticVars.initialHp - 1
                    )

                    expect(actor.system.attributes.hp.value).to.equal(staticVars.initialHp - 1)
                } finally {
                    rollHelper.restore()
                }
            }
        },
        {
            name: (vars) => `Gift of Prodigiuos Talent with ${vars.names[0]} and ${vars.names[1]} roll 2 on skill check`,

            loop: () => [
                {
                    skills: [SKILL.ACROBATICS, SKILL.ARCANA],
                    names: ["Acrobatics", "Arcana"],
                    icons: ["Acrobatics", "Arcana"]
                },
                {
                    skills: [SKILL.ANIMAL_HANDLING, SKILL.ATHLETICS],
                    names: ["Animal Handling", "Athletics"],
                    icons: ["AnimalHandling", "Athletics"]
                },
                {
                    skills: [SKILL.DECEPTION, SKILL.HISTORY],
                    names: ["Deception", "History"],
                    icons: ["Deception", "History"]
                },
                {
                    skills: [SKILL.INSIGHT, SKILL.INTIMIDATION],
                    names: ["Insight", "Intimidation"],
                    icons: ["Insight", "Intimidation"]
                },
                {
                    skills: [SKILL.INVESTIGATION, SKILL.MEDICINE],
                    names: ["Investigation", "Medicine"],
                    icons: ["Investigation", "Medicine"]
                },
                {
                    skills: [SKILL.NATURE, SKILL.PERCEPTION],
                    names: ["Nature", "Perception"],
                    icons: ["Nature", "Perception"]
                },
                {
                    skills: [SKILL.PERFORMANCE, SKILL.PERSUASION],
                    names: ["Performance", "Persuasion"],
                    icons: ["Performance", "Persuasion"]
                },
                {
                    skills: [SKILL.RELIGION, SKILL.SLEIGHT_OF_HAND],
                    names: ["Religion", "Sleight of Hand"],
                    icons: ["Religion", "SleightOfHand"]
                },
                {
                    skills: [SKILL.STEALTH, SKILL.SURVIVAL],
                    names: ["Stealth", "Survival"],
                    icons: ["Stealth", "Survival"]
                }
            ],
            setup: async ({actor, helpers, loopVars}) =>
            {
                const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                await helpers.createActorItemAndWait(
                    actor,
                    foundCharacterClass,
                    {
                        setTransformationFlags: false,
                        setDdbImporterFlag: false,
                        applyAdvancements: false
                    }
                )
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    },
                    {
                        name: "Gift of Prodigious Talent",
                        choice: [
                            {
                                id: loopVars.skills[0],
                                label: loopVars.names[0],
                                icon: `modules/transformations/icons/skills/${loopVars.icons[0]}.png`,
                                raw: `skills:${loopVars.skills[0]}`,
                                value: loopVars.skills[0],
                                mode: "forcedExpertise"
                            },
                            {
                                id: loopVars.skills[1],
                                label: loopVars.names[1],
                                icon: `modules/transformations/icons/skills/${loopVars.icons[1]}.png`,
                                raw: `skills:${loopVars.skills[1]}`,
                                value: loopVars.skills[1],
                                mode: "forcedExpertise"
                            }
                        ]
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfProdigiousTalent")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Prodigious Talent")
                    )
                    runtime.services.triggerRuntime.run("skillCheck", actor, {
                        checks: {
                            current: {
                                ability: "abi",
                                skill: loopVars.skills[0],
                                naturalRoll: 2,
                                total: 2
                            }
                        }
                    })
                }
            ],

            await: async ({
                actor,
                runtime,
                waiters,
                staticVars
            }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                    actor.flags?.transformations?.fiend?.giftOfProdigiousTalent?.longRestsLeftUntilFullHitDieRestoration === 2
                )
            },

            assertions: async ({actor, assert, waiters, helpers, staticVars, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.flags.match.push({
                    path: "transformations.fiend.giftOfProdigiousTalent",
                    expected: {
                        skills: [loopVars.skills[0], loopVars.skills[1]],
                        longRestsLeftUntilFullHitDieRestoration: 2
                    }
                })
                actorDto.stats.hitDices.max = 1
                actorDto.stats.hitDices.value = 0
                validate(actorDto, {assert})
            }
        },

        {
            name: (vars) => `Gift of Prodigiuos Talent with ${vars.names[0]} and ${vars.names[1]} roll 3 on skill check`,

            loop: () => [
                {
                    skills: [SKILL.ACROBATICS, SKILL.ARCANA],
                    names: ["Acrobatics", "Arcana"],
                    icons: ["Acrobatics", "Arcana"]
                },
                {
                    skills: [SKILL.ANIMAL_HANDLING, SKILL.ATHLETICS],
                    names: ["Animal Handling", "Athletics"],
                    icons: ["AnimalHandling", "Athletics"]
                },
                {
                    skills: [SKILL.DECEPTION, SKILL.HISTORY],
                    names: ["Deception", "History"],
                    icons: ["Deception", "History"]
                },
                {
                    skills: [SKILL.INSIGHT, SKILL.INTIMIDATION],
                    names: ["Insight", "Intimidation"],
                    icons: ["Insight", "Intimidation"]
                },
                {
                    skills: [SKILL.INVESTIGATION, SKILL.MEDICINE],
                    names: ["Investigation", "Medicine"],
                    icons: ["Investigation", "Medicine"]
                },
                {
                    skills: [SKILL.NATURE, SKILL.PERCEPTION],
                    names: ["Nature", "Perception"],
                    icons: ["Nature", "Perception"]
                },
                {
                    skills: [SKILL.PERFORMANCE, SKILL.PERSUASION],
                    names: ["Performance", "Persuasion"],
                    icons: ["Performance", "Persuasion"]
                },
                {
                    skills: [SKILL.RELIGION, SKILL.SLEIGHT_OF_HAND],
                    names: ["Religion", "Sleight of Hand"],
                    icons: ["Religion", "SleightOfHand"]
                },
                {
                    skills: [SKILL.STEALTH, SKILL.SURVIVAL],
                    names: ["Stealth", "Survival"],
                    icons: ["Stealth", "Survival"]
                }
            ],
            setup: async ({actor, helpers, loopVars}) =>
            {
                const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                await helpers.createActorItemAndWait(
                    actor,
                    foundCharacterClass,
                    {
                        setTransformationFlags: false,
                        setDdbImporterFlag: false,
                        applyAdvancements: false
                    }
                )
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    },
                    {
                        name: "Gift of Prodigious Talent",
                        choice: [
                            {
                                id: loopVars.skills[0],
                                label: loopVars.names[0],
                                icon: `modules/transformations/icons/skills/${loopVars.icons[0]}.png`,
                                raw: `skills:${loopVars.skills[0]}`,
                                value: loopVars.skills[0],
                                mode: "forcedExpertise"
                            },
                            {
                                id: loopVars.skills[1],
                                label: loopVars.names[1],
                                icon: `modules/transformations/icons/skills/${loopVars.icons[1]}.png`,
                                raw: `skills:${loopVars.skills[1]}`,
                                value: loopVars.skills[1],
                                mode: "forcedExpertise"
                            }
                        ]
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfProdigiousTalent")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Prodigious Talent")
                    )
                    runtime.services.triggerRuntime.run("skillCheck", actor, {
                        checks: {
                            current: {
                                ability: "abi",
                                skill: loopVars.skills[0],
                                naturalRoll: 3,
                                total: 2
                            }
                        }
                    })
                }
            ],

            await: async ({
                actor,
                runtime,
                waiters,
                staticVars
            }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                    actor.flags?.transformations?.fiend?.giftOfProdigiousTalent?.longRestsLeftUntilFullHitDieRestoration === 0
                )
            },

            assertions: async ({actor, assert, waiters, helpers, staticVars, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.flags.match.push({
                    path: "transformations.fiend.giftOfProdigiousTalent",
                    expected: {
                        skills: [loopVars.skills[0], loopVars.skills[1]],
                        longRestsLeftUntilFullHitDieRestoration: 0
                    }
                })
                actorDto.stats.hitDices.max = 1
                actorDto.stats.hitDices.value = 1
                validate(actorDto, {assert})
            }
        },

        {
            name: `Gift of Prodigiuos Talent long rest subtracts one from longRestsLeftUntilFullHitDieRestoration`,
            setup: async ({actor, helpers, loopVars}) =>
            {
                const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                await helpers.createActorItemAndWait(
                    actor,
                    foundCharacterClass,
                    {
                        setTransformationFlags: false,
                        setDdbImporterFlag: false,
                        applyAdvancements: false
                    }
                )
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    },
                    {
                        name: "Gift of Prodigious Talent",
                        choice: [
                            {
                                id: SKILL.ACROBATICS,
                                label: "Acrobatics",
                                icon: `modules/transformations/icons/skills/Acrobatics.png`,
                                raw: `skills:${SKILL.ACROBATICS}`,
                                value: SKILL.ACROBATICS,
                                mode: "forcedExpertise"
                            },
                            {
                                id: SKILL.ARCANA,
                                label: "Arcana",
                                icon: `modules/transformations/icons/skills/Arcana.png`,
                                raw: `skills:${SKILL.ARCANA}`,
                                value: SKILL.ARCANA,
                                mode: "forcedExpertise"
                            }
                        ]
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfProdigiousTalent")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Prodigious Talent")
                    )
                    runtime.services.triggerRuntime.run("skillCheck", actor, {
                        checks: {
                            current: {
                                ability: "abi",
                                skill: SKILL.ACROBATICS,
                                naturalRoll: 1,
                                total: 1
                            }
                        }
                    })
                    await waiters.waitForCondition(() =>
                        actor.flags?.transformations?.fiend?.giftOfProdigiousTalent?.longRestsLeftUntilFullHitDieRestoration === 2
                    )
                    await runtime.services.triggerRuntime.run("longRest", actor)
                }
            ],

            await: async ({
                actor,
                runtime,
                waiters,
                staticVars
            }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForCondition(() =>
                    actor.flags?.transformations?.fiend?.giftOfProdigiousTalent?.longRestsLeftUntilFullHitDieRestoration === 1
                )
            },

            assertions: async ({actor, assert, waiters, helpers, staticVars, loopVars}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.flags.match.push({
                    path: "transformations.fiend.giftOfProdigiousTalent",
                    expected: {
                        skills: [SKILL.ACROBATICS, SKILL.ARCANA],
                        longRestsLeftUntilFullHitDieRestoration: 1
                    }
                })
                actorDto.stats.hitDices.max = 1
                actorDto.stats.hitDices.value = 0
                validate(actorDto, {assert})
            }
        },

        {
            name: `Gift of Unsurpassed Fortune no uses used on success`,
            setup: async ({actor, helpers, loopVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    staticVars.initialMessageCount = game.messages.contents.length
                    await actor.update({
                        "system.attributes.hp.value": (actor.system.attributes.hp.max / 2) - 1
                    })
                    staticVars.initialHp = actor.system.attributes.hp.value

                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Unsurpassed Fortune")
                    )
                    const giftOfJoyousLife = actor.items.find(i => i.name == "Gift of Unsurpassed Fortune")
                    const activity = giftOfJoyousLife.system.activities.find(a => a.name == "Gift of Unsurpassed Fortune")
                    await activity.use({actor})

                    await waiters.waitForCondition(() =>
                        game.messages.contents.length > staticVars.initialMessageCount
                    )

                    staticVars.message = game.messages.contents.at(-1)
                    allowMockRollMessageUpdates(staticVars.message)
                    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
                        message: staticVars.message
                    })
                }
            ],

            await: async ({
                waiters,
                staticVars
            }) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll"
                })
            },

            assertions: async ({actor, expect, assert, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Unsurpassed Fortune chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfUnsurpassedFortune")

                    chatCardHelper.assertButtonExists({
                        text: "Roll"
                    }, expect)

                    rollHelper.queueRoll({
                        total: 6
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    expect(
                        rollHelper.getCalls().some(call => call.type === "roll"),
                        "Clicking Roll Hit Die should invoke Roll.roll()"
                    ).to.equal(true)

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.total).to.equal(6)

                    const actorDto = new ActorValidationDTO(actor)
                    actorDto.addItem(item => {
                        item.itemName = "Gift of Unsurpassed Fortune"
                        item.usesLeft = 1
                        item.uses = 1
                    })
                    validate(actorDto, {assert})
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Unsurpassed Fortune uses used on fail`,
            setup: async ({actor, helpers, loopVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars, loopVars}) =>
                {
                    staticVars.initialMessageCount = game.messages.contents.length
                    await actor.update({
                        "system.attributes.hp.value": (actor.system.attributes.hp.max / 2) - 1
                    })
                    staticVars.initialHp = actor.system.attributes.hp.value

                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Unsurpassed Fortune")
                    )
                    const giftOfJoyousLife = actor.items.find(i => i.name == "Gift of Unsurpassed Fortune")
                    const activity = giftOfJoyousLife.system.activities.find(a => a.name == "Gift of Unsurpassed Fortune")
                    await activity.use({actor})

                    await waiters.waitForCondition(() =>
                        game.messages.contents.length > staticVars.initialMessageCount
                    )

                    staticVars.message = game.messages.contents.at(-1)
                    allowMockRollMessageUpdates(staticVars.message)
                    staticVars.chatCardHelper = helpers.createChatCardTestHelper({
                        message: staticVars.message
                    })
                }
            ],

            await: async ({
                waiters,
                staticVars
            }) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll"
                })
            },

            assertions: async ({actor, expect, assert, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Unsurpassed Fortune chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfUnsurpassedFortune")

                    chatCardHelper.assertButtonExists({
                        text: "Roll"
                    }, expect)

                    rollHelper.queueRoll({
                        total: 5
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    expect(
                        rollHelper.getCalls().some(call => call.type === "roll"),
                        "Clicking Roll Hit Die should invoke Roll.roll()"
                    ).to.equal(true)

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.total).to.equal(5)

                    const actorDto = new ActorValidationDTO(actor)
                    actorDto.addItem(item => {
                        item.itemName = "Gift of Unsurpassed Fortune"
                        item.usesLeft = 0
                        item.uses = 1
                    })
                    validate(actorDto, {assert})
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: "Fiend Form hide fiend form",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
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
                effectDto.has.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw success on bloodied",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
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
                effectDto.has.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw fail on bloodied",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
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
                effectDto.notHas.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw success on unconscious",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
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
                effectDto.has.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw fail on unconscious",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
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
                effectDto.notHas.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw success on beginConcentration",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
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
                effectDto.has.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: "Fiend Form saving throw fail on beginConcentration",

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({actor, helpers}) =>
                {
                    await applyHidingFiendAppearance({
                        actor,
                        helpers
                    })
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
                effectDto.notHas.push("Hiding Fiend Appearance")

                actorDto.effects = effectDto
                validate(actorDto, {assert})
            }
        },

        {
            name: `Enhanced Contract consumes item use on gift of Damnation`,
            setup: async ({actor, helpers, loopVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            steps: [
                async ({actor, runtime}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})
                }
            ],

            await: async ({
                actor,
                waiters,
                runtime
            }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForNextFrame()
                await waiters.waitForCondition(() =>
                    actor.items.some(i => i.name === "Gift of Unsurpassed Fortune")
                )
            },

            assertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.hp = [10, "temp"]
                actorDto.addItem(item => {
                    item.itemName = "Enhanced Contract"
                    item.usesLeft = 0
                })
                validate(actorDto, {assert})
            }
        },

        {
            name: `Enhanced Contract no temp hp added if no charges left when activating gift of Damnation`,
            setup: async ({actor, helpers, loopVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                globalThis.___TransformationTestEnvironment___.choosenAdvancement = [
                    {
                        name: "Fiendish Soul",
                        choice: {
                            icon: "modules/transformations/icons/damageTypes/Acid.png",
                            id: "acid",
                            label: "Acid",
                            raw: "dr:acid",
                            value: "acid"
                        }
                    }
                ]
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            steps: [
                async ({actor, runtime}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})
                }
            ],

            await: async ({
                actor,
                waiters,
                runtime
            }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
                await waiters.waitForNextFrame()
                await waiters.waitForCondition(() =>
                    actor.items.some(i => i.name === "Gift of Unsurpassed Fortune")
                )
                await actor.update({
                    "system.attributes.hp.temp": 0
                })
                const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                await runtime.services.applyFiendGiftOfDamnation({actor, gift})
            },

            assertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.stats.hp = [0, "temp"]
                actorDto.addItem(item => {
                    item.itemName = "Enhanced Contract"
                    item.usesLeft = 0
                })
                validate(actorDto, {assert})
            }
        },

        {
            name: `Gift of Unfettered Glory increases hitDiereduction after hit die roll`,

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            steps: [
                async ({actor, runtime, waiters, staticVars}) =>
                {
                    await applyGiftOfUnfetteredGloryAndTriggerHitDie({
                        actor,
                        runtime,
                        waiters,
                        staticVars
                    })
                }
            ],

            await: async ({actor, waiters}) =>
            {
                await waiters.waitForCondition(() =>
                    actor.flags?.transformations?.fiend?.giftOfUnfetteredGlory?.hitDieModifier === 2
                )
            },

            assertions: async ({actor, assert, staticVars}) =>
            {
                assert.deepEqual(
                    staticVars.context.rolls[0].parts,
                    ["1d8"]
                )
                assert.equal(
                    actor.flags?.transformations?.fiend?.giftOfUnfetteredGlory?.hitDieModifier,
                    2
                )
            }
        },

        {
            name: `Gift of Unfettered Glory adds -2 to hit die roll`,

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                }
            ],

            steps: [
                async ({actor, runtime, waiters, staticVars}) =>
                {
                    await applyGiftOfUnfetteredGloryAndTriggerHitDie({
                        actor,
                        runtime,
                        waiters,
                        staticVars
                    })
                    const transformation = runtime.services.transformationRegistry.getEntryForActor(actor)
                    transformation.TransformationClass.onPreRollHitDie(staticVars.context, actor)
                }
            ],

            assertions: async ({staticVars, assert}) =>
            {
                assert.deepEqual(
                    staticVars.context.rolls[0].parts,
                    ["1d8-2"]
                )
            }
        },

        {
            name: `Devilish Subcontractor makes it possible to have two gifts of damnation at the same time`,

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM",
                            3: "Compendium.transformations.gh-transformations.Item.1DPOphqvUFg1Yzfm"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                }
            ],

            steps: [
                async ({actor, runtime, waiters, staticVars}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})
                    const gift2 = giftsOfDamnation.find(entry => entry.id === "giftOfJoyousLife")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift2})
                }
            ],

            assertions: async ({actor, assert}) =>
            {
                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemsWithSourceUuid = [
                    "Compendium.transformations.gh-transformations.Item.97GBQgFFed1p1vMJ",
                    "Compendium.transformations.gh-transformations.Item.zzXZ3tex07ScSN5L"
                ]
                validate(actorDto, {assert})
            }
        },

        {
            name: `Devilish Subcontractor can replace one of two gifts of damnation via choice dialog`,

            setup: async ({actor}) =>
            {
                await actor.update({
                    "flags.transformations.stageChoices": {
                        "fiend": {
                            1: "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf",
                            2: "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM",
                            3: "Compendium.transformations.gh-transformations.Item.1DPOphqvUFg1Yzfm"
                        }
                    }
                })
                setFiendStage1DamageResistanceChoice()
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                }
            ],

            steps: [
                async ({actor, runtime, waiters, staticVars}) =>
                {
                    const gift = giftsOfDamnation.find(entry => entry.id === "giftOfUnsurpassedFortune")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift})

                    const gift2 = giftsOfDamnation.find(entry => entry.id === "giftOfJoyousLife")
                    await runtime.services.applyFiendGiftOfDamnation({actor, gift: gift2})

                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Unsurpassed Fortune") &&
                        actor.items.some(i => i.name === "Gift of Joyous Life")
                    )
                    await waiters.waitForCondition(() =>
                        actor.effects.some(effect =>
                            effect.flags?.transformations?.giftOfDamnationId === "giftOfJoyousLife"
                        )
                    )

                    const giftOfJoyousLifeEffect = actor.effects.find(effect =>
                        effect.flags?.transformations?.giftOfDamnationId === "giftOfJoyousLife"
                    )

                    const gift3 = giftsOfDamnation.find(entry => entry.id === "giftOfUnfetteredGlory")
                    const applyGiftPromise = runtime.services.applyFiendGiftOfDamnation({
                        actor,
                        gift: gift3
                    })

                    const dialog = await findTransformationGeneralChoiceDialog(actor)
                    staticVars.removalDialogTitle =
                        getTransformationGeneralChoiceDialogWindowTitle(dialog)?.textContent?.trim()
                    staticVars.removalDialogChoices = [...dialog.querySelectorAll(".choice-button")]
                    .map(button => button.textContent.trim())

                    const removeGiftOfJoyousLifeButton =
                              await findTransformationGeneralChoiceButtonById(
                                  dialog,
                                  giftOfJoyousLifeEffect.id
                              )

                    removeGiftOfJoyousLifeButton.click()

                    await waiters.waitForNextFrame()
                    await waiters.waitForElementGone({
                        selector: `#transformation-general-choice-${actor.id}`
                    })

                    await applyGiftPromise
                    await waiters.waitForDomainStability({
                        actor,
                        asyncTrackers: runtime.dependencies.utils.asyncTrackers
                    })
                    await waiters.waitForNextFrame()
                    await waiters.waitForCondition(() =>
                        actor.items.some(i => i.name === "Gift of Unsurpassed Fortune") &&
                        actor.items.some(i => i.name === "Gift of Unfettered Glory") &&
                        !actor.items.some(i => i.name === "Gift of Joyous Life")
                    )
                }
            ],

            assertions: async ({actor, assert, staticVars}) =>
            {
                assert.equal(
                    staticVars.removalDialogTitle,
                    "choose an effect to remove"
                )
                assert.sameMembers(
                    staticVars.removalDialogChoices,
                    [
                        "Gift of Unsurpassed Fortune",
                        "Gift of Joyous Life"
                    ]
                )

                const actorDto = new ActorValidationDTO(actor)
                actorDto.hasItemsWithSourceUuid = [
                    "Compendium.transformations.gh-transformations.Item.97GBQgFFed1p1vMJ",
                    "Compendium.transformations.gh-transformations.Item.RyzgJyXTAcpO0hRn"
                ]
                validate(actorDto, {assert})
            }
        },

        {
            name: `Gift of Second Chances success`,

            setup: async ({actor, helpers}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )

                await setFiendStage3GiftChoices(actor)
                const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                await helpers.createActorItemAndWait(
                    actor,
                    foundCharacterClass,
                    {
                        setTransformationFlags: false,
                        setDdbImporterFlag: false,
                        applyAdvancements: false
                    }
                )
                await actor.update({
                    "system.attributes.hp.value": 0,
                    "system.attributes.death.success": 0,
                    "system.attributes.death.failure": 0
                })
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    staticVars.initialHp = actor.system.attributes.hp.value
                    staticVars.initialDeathFailures =
                        Number(actor.system.attributes.death.failure ?? 0)

                    await prepareFiendGiftChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars,
                        giftId: "giftOfSecondChances",
                        itemName: "Gift of Second Chances"
                    })
                }
            ],

            await: async ({waiters, staticVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll Hit Die"
                })
            },

            assertions: async ({actor, expect, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper, message} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Second Chances chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfSecondChances")

                    chatCardHelper.assertButtonExists({
                        text: "Roll Hit Die"
                    }, expect)

                    rollHelper.queueRoll({
                        total: 6
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll Hit Die"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.formula).to.equal(`1${message.flags?.transformations?.hitDie}`)
                    expect(presentedRolls[0]?.total).to.equal(6)
                    expect(chatCardHelper.hasButton({
                        text: "Roll Hit Die"
                    })).to.equal(false)

                    await chatCardHelper.waitForButton({
                        text: "Apply healing"
                    })

                    await message.update({
                        "flags.transformations.secondChancesPersistenceCheck": true
                    })
                    await waiters.waitForNextFrame()

                    const persistedRolls = chatCardHelper.getPresentedRolls()
                    expect(persistedRolls[0]?.total).to.equal(6)
                    chatCardHelper.assertButtonExists({
                        text: "Apply healing"
                    }, expect)

                    await chatCardHelper.clickButton({
                        text: "Apply healing"
                    })

                    await waiters.waitForCondition(() =>
                        actor.system.attributes.hp.value === 6
                    )

                    expect(actor.system.attributes.hp.value).to.equal(6)
                    expect(actor.system.attributes.death.failure).to.equal(
                        staticVars.initialDeathFailures
                    )
                    expect(chatCardHelper.hasButton({
                        text: "Apply healing"
                    })).to.equal(false)
                    expect(chatCardHelper.getPresentedRolls()[0]?.total).to.equal(6)
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Second Chances fail`,

            setup: async ({actor, helpers}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await setFiendStage3GiftChoices(actor)
                const foundCharacterClass = await helpers.getCharacterClass("Wizard")
                await helpers.createActorItemAndWait(
                    actor,
                    foundCharacterClass,
                    {
                        setTransformationFlags: false,
                        setDdbImporterFlag: false,
                        applyAdvancements: false
                    }
                )
                await actor.update({
                    "system.attributes.hp.value": 0,
                    "system.attributes.death.success": 0,
                    "system.attributes.death.failure": 0
                })
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    staticVars.initialDeathFailures =
                        Number(actor.system.attributes.death.failure ?? 0)

                    await prepareFiendGiftChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars,
                        giftId: "giftOfSecondChances",
                        itemName: "Gift of Second Chances"
                    })
                }
            ],

            await: async ({waiters, staticVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll Hit Die"
                })
            },

            assertions: async ({actor, expect, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper, message} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Second Chances chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfSecondChances")

                    rollHelper.queueRoll({
                        total: 1
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll Hit Die"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    await waiters.waitForCondition(() =>
                        actor.system.attributes.death.failure === staticVars.initialDeathFailures + 1
                    )

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.formula).to.equal(`1${message.flags?.transformations?.hitDie}`)
                    expect(presentedRolls[0]?.total).to.equal(1)
                    expect(chatCardHelper.hasButton({
                        text: "Roll Hit Die"
                    })).to.equal(false)
                    expect(chatCardHelper.hasButton({
                        text: "Apply healing"
                    })).to.equal(false)

                    await message.update({
                        "flags.transformations.secondChancesFailurePersistenceCheck": true
                    })
                    await waiters.waitForNextFrame()

                    expect(chatCardHelper.getPresentedRolls()[0]?.total).to.equal(1)
                    expect(actor.system.attributes.hp.value).to.equal(0)
                    expect(actor.system.attributes.death.failure).to.equal(
                        staticVars.initialDeathFailures + 1
                    )
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Unconditional Love success`,

            setup: async ({actor}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await setFiendStage3GiftChoices(actor)
                await actor.update({
                    "system.attributes.hp.temp": 0
                })
                await actor.toggleStatusEffect("prone", {active: false})
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    await prepareFiendGiftClassChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars,
                        giftId: "giftOfUnconditionalLove",
                        itemName: "Gift of Unconditional Love"
                    })
                }
            ],

            await: async ({waiters, staticVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll"
                })
            },

            assertions: async ({actor, expect, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper, message} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Unconditional Love chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfUnconditionalLove")

                    chatCardHelper.assertButtonExists({
                        text: "Roll"
                    }, expect)

                    rollHelper.queueRoll({
                        total: 9,
                        diceResults: [6]
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.formula).to.equal(message.flags?.transformations?.rollFormula)
                    expect(presentedRolls[0]?.total).to.equal(9)
                    expect(chatCardHelper.hasButton({
                        text: "Roll"
                    })).to.equal(false)

                    await chatCardHelper.waitForButton({
                        text: "Apply Temp HP"
                    })

                    await message.update({
                        "flags.transformations.unconditionalLovePersistenceCheck": true
                    })
                    await waiters.waitForNextFrame()

                    expect(chatCardHelper.getPresentedRolls()[0]?.total).to.equal(9)
                    chatCardHelper.assertButtonExists({
                        text: "Apply Temp HP"
                    }, expect)

                    await chatCardHelper.clickButton({
                        text: "Apply Temp HP"
                    })

                    await waiters.waitForCondition(() =>
                        actor.system.attributes.hp.temp === 9
                    )

                    expect(actor.system.attributes.hp.temp).to.equal(9)
                    expect(
                        actor.effects.some(effect =>
                            Array.from(effect.statuses ?? []).includes("prone")
                        )
                    ).to.equal(false)
                    expect(chatCardHelper.hasButton({
                        text: "Apply Temp HP"
                    })).to.equal(false)
                    expect(chatCardHelper.getPresentedRolls()[0]?.total).to.equal(9)
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Unconditional Love fail`,

            setup: async ({actor}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await setFiendStage3GiftChoices(actor)
                await actor.update({
                    "system.attributes.hp.temp": 0
                })
                await actor.toggleStatusEffect("prone", {active: false})
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    await prepareFiendGiftClassChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars,
                        giftId: "giftOfUnconditionalLove",
                        itemName: "Gift of Unconditional Love"
                    })
                }
            ],

            await: async ({waiters, staticVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Roll"
                })
            },

            assertions: async ({actor, expect, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper, message} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Unconditional Love chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfUnconditionalLove")

                    rollHelper.queueRoll({
                        total: 4,
                        diceResults: [1]
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call => call.type === "roll")
                    )

                    await waiters.waitForCondition(() =>
                        actor.effects.some(effect =>
                            Array.from(effect.statuses ?? []).includes("prone")
                        )
                    )

                    const presentedRolls = await chatCardHelper.waitForPresentedRolls({count: 1})
                    expect(presentedRolls[0]?.formula).to.equal(message.flags?.transformations?.rollFormula)
                    expect(presentedRolls[0]?.total).to.equal(4)
                    expect(chatCardHelper.hasButton({
                        text: "Roll"
                    })).to.equal(false)
                    expect(chatCardHelper.hasButton({
                        text: "Apply Temp HP"
                    })).to.equal(false)

                    await message.update({
                        "flags.transformations.unconditionalLoveFailurePersistenceCheck": true
                    })
                    await waiters.waitForNextFrame()

                    expect(chatCardHelper.getPresentedRolls()[0]?.total).to.equal(4)
                    expect(actor.system.attributes.hp.temp ?? 0).to.equal(0)
                    expect(
                        actor.effects.some(effect =>
                            Array.from(effect.statuses ?? []).includes("prone")
                        )
                    ).to.equal(true)
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Martial Prowess uses the previous attack formula and keeps both rolls visible`,

            setup: async ({actor, helpers, staticVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await setFiendStage3GiftChoices(actor)
                staticVars.classItem = await createCharacterClassWithHitDice({
                    actor,
                    helpers,
                    className: "Fighter",
                    hitDiceValue: 4
                })
                staticVars.initialHitDice =
                    actor.items.get(staticVars.classItem.id)?.system?.hd?.value
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                },
                {
                    stage: 4,
                    choose: FIEND_STAGE_4_CHOICE_UUID
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    const transformation =
                              runtime.services.transformationRegistry.getEntryForActor(actor)

                    await transformation.TransformationClass.onRoll(actor, {
                        hookName: "dnd5e.rollAttack",
                        natural: 15,
                        total: 18,
                        roll: {
                            formula: "2d20kh+7"
                        }
                    })

                    await prepareFiendGiftChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars,
                        giftId: "giftOfMartialProwess",
                        itemName: "Gift of Martial Prowess"
                    })
                }
            ],

            await: async ({staticVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Attack"
                })
            },

            assertions: async ({actor, expect, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    const card = chatCardHelper.getCardElement({require: true})

                    expect(card, "Gift of Martial Prowess chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfMartialProwess")

                    chatCardHelper.assertButtonExists({
                        text: "Attack"
                    }, expect)

                    rollHelper.queueRoll({
                        formula: "2d20kh+7",
                        total: 18,
                        diceResults: [12, 18]
                    })

                    await chatCardHelper.clickButton({
                        text: "Attack"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call =>
                            call.type === "roll" &&
                            call.formula === "2d20kh+7"
                        )
                    )

                    const attackRolls =
                              await chatCardHelper.waitForPresentedRolls({count: 1})

                    expect(attackRolls[0]?.formula).to.equal("2d20kh+7")
                    expect(attackRolls[0]?.total).to.equal(18)
                    expect(chatCardHelper.hasButton({
                        text: "Attack"
                    })).to.equal(false)

                    await chatCardHelper.waitForButton({
                        text: "Roll Damage"
                    })

                    allowMockRollMessageUpdates(chatCardHelper.getMessage())
                    await waiters.waitForCondition(() =>
                        Array.isArray(chatCardHelper.getMessage()?.rolls) &&
                        chatCardHelper.getMessage().rolls.length >= 1
                    )

                    rollHelper.queueRoll({
                        formula: "3d10",
                        total: 21,
                        diceResults: [8, 7, 6]
                    })

                    await chatCardHelper.clickButton({
                        text: "Roll Damage"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call =>
                            call.type === "roll" &&
                            call.formula === "3d10"
                        )
                    )

                    const finalRolls =
                              await chatCardHelper.waitForPresentedRolls({count: 2})

                    expect(finalRolls[0]?.formula).to.equal("2d20kh+7")
                    expect(finalRolls[0]?.total).to.equal(18)
                    expect(finalRolls[1]?.formula).to.equal("3d10")
                    expect(finalRolls[1]?.total).to.equal(21)
                    expect(chatCardHelper.hasButton({
                        text: "Roll Damage"
                    })).to.equal(false)

                    allowMockRollMessageUpdates(chatCardHelper.getMessage())
                    await chatCardHelper.getMessage().update({
                        "flags.transformations.martialProwessDamagePersistenceCheck": true
                    })
                    await waiters.waitForNextFrame()

                    const persistedRolls = chatCardHelper.getPresentedRolls()
                    expect(persistedRolls.map(roll => roll.total)).to.deep.equal([
                        18,
                        21
                    ])
                    expect(
                        actor.items.get(staticVars.classItem.id)?.system?.hd?.value
                    ).to.equal(staticVars.initialHitDice)
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Martial Prowess falls back to 1d20 without a stored attack roll`,

            setup: async ({actor, helpers}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await setFiendStage3GiftChoices(actor)
                await createCharacterClassWithHitDice({
                    actor,
                    helpers,
                    className: "Fighter",
                    hitDiceValue: 4
                })
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                },
                {
                    stage: 4,
                    choose: FIEND_STAGE_4_CHOICE_UUID
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    await prepareFiendGiftChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars,
                        giftId: "giftOfMartialProwess",
                        itemName: "Gift of Martial Prowess"
                    })
                }
            ],

            await: async ({staticVars}) =>
            {
                await staticVars.chatCardHelper.waitForCard()
                await staticVars.chatCardHelper.waitForButton({
                    text: "Attack"
                })
            },

            assertions: async ({expect, waiters, helpers, staticVars}) =>
            {
                const {chatCardHelper, message} = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()

                try {
                    rollHelper.queueRoll({
                        formula: "1d20",
                        total: 11,
                        diceResults: [11]
                    })

                    await chatCardHelper.clickButton({
                        text: "Attack"
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call =>
                            call.type === "roll" &&
                            call.formula === "1d20"
                        )
                    )

                    const presentedRolls =
                              await chatCardHelper.waitForPresentedRolls({count: 1})

                    expect(message.flags?.transformations?.attackFormula).to.equal("1d20")
                    expect(presentedRolls[0]?.formula).to.equal("1d20")
                    expect(presentedRolls[0]?.total).to.equal(11)
                    await chatCardHelper.waitForButton({
                        text: "Roll Damage"
                    })
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Unbridled Power does not render a card with fewer than two available hit dice`,

            setup: async ({actor, helpers, staticVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await setFiendStage3GiftChoices(actor)
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                },
                {
                    stage: 4,
                    choose: FIEND_STAGE_4_CHOICE_UUID
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    staticVars.classItem = await createCharacterClassWithHitDice({
                        actor,
                        helpers,
                        className: "Wizard",
                        hitDiceValue: 1
                    })

                    await prepareFiendUnbridledPowerClassChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars
                    })
                }
            ],

            assertions: async ({actor, expect, staticVars}) =>
            {
                const {chatCardHelper, message} = staticVars

                expect(message).to.exist
                expect(chatCardHelper.getCardElement()).to.equal(null)
                expect(chatCardHelper.hasButton({
                    text: "Roll"
                })).to.equal(false)
                expect(chatCardHelper.getButtons()).to.have.length(0)
                expect(message.flags?.transformations).to.equal(undefined)
                expect(String(message.content ?? "")).to.not.equal("")
                expect(message.content).to.not.contain("<button")
                expect(message.content).to.not.contain(`data-transformations-card`)
                expect(
                    actor.items.get(staticVars.classItem.id)?.system?.hd?.value
                ).to.equal(1)
            }
        },

        {
            name: `Gift of Unbridled Power restores spell slots, consumes hit dice, and keeps the roll visible`,

            setup: async ({actor, helpers, staticVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await setFiendStage3GiftChoices(actor)
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                },
                {
                    stage: 4,
                    choose: FIEND_STAGE_4_CHOICE_UUID
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    staticVars.classItem = await createCharacterClassWithHitDice({
                        actor,
                        helpers,
                        className: "Wizard",
                        hitDiceValue: 4,
                        levels: 20
                    })
                    staticVars.initialHitDice =
                        actor.items.get(staticVars.classItem.id)?.system?.hd?.value
                    staticVars.initialHp = actor.system.attributes.hp.value

                    await actor.update({
                        "system.spells.spell1.override": 3,
                        "system.spells.spell1.value": 0,
                        "system.spells.spell2.override": 2,
                        "system.spells.spell2.value": 0,
                        "system.spells.spell3.override": 1,
                        "system.spells.spell3.value": 1,
                        "system.spells.pact.max": 0,
                        "system.spells.pact.value": 0,
                        "system.spells.pact.level": 0
                    })

                    await prepareFiendUnbridledPowerClassChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars
                    })
                }
            ],

            assertions: async ({actor, runtime, expect, waiters, helpers, staticVars}) =>
            {
                const {
                          chatCardHelper,
                          message,
                          unbridledPowerGiftClass: GiftClass,
                          unbridledPowerActorRepository: actorRepository
                      } = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()
                const dialogCalls = []
                const dialogFactory = {
                    async openFiendUnbridledPowerSpellSlotRecovery(args)
                    {
                        dialogCalls.push(args)
                        return [
                            {
                                slotKey: "spell1",
                                level: 1,
                                cost: 1,
                                slotType: "spell"
                            },
                            {
                                slotKey: "spell1",
                                level: 1,
                                cost: 1,
                                slotType: "spell"
                            },
                            {
                                slotKey: "spell2",
                                level: 2,
                                cost: 2,
                                slotType: "spell"
                            }
                        ]
                    }
                }

                try {
                    const card = chatCardHelper.getCardElement()

                    // expect(card, "Gift of Unbridled Power chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfUnbridledPower")
                    expect(message.content).to.contain(`data-gift="giftOfUnbridledPower"`)
                    expect(message.flags?.transformations?.state).to.equal("initial")
                    expect(message.flags?.transformations?.hitDie).to.equal("d6")
                    chatCardHelper.assertButtonExists({
                        text: "Roll"
                    }, expect)

                    rollHelper.queueRoll({
                        formula: "2d6",
                        total: 4,
                        diceResults: [1, 3]
                    })

                    await GiftClass.actions.roll({
                        actor,
                        message,
                        actorRepository,
                        RollService,
                        ChatMessagePartInjector: runtime.ui.ChatMessagePartInjector,
                        GiftClass
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call =>
                            call.type === "roll" &&
                            call.formula === "2d6"
                        )
                    )

                    await waiters.waitForCondition(() =>
                        actor.items.get(staticVars.classItem.id)?.system?.hd?.value ===
                        staticVars.initialHitDice - 2
                    )

                    const presentedRolls =
                              await chatCardHelper.waitForPresentedRolls({count: 1})

                    expect(presentedRolls[0]?.formula).to.equal("2d6")
                    expect(presentedRolls[0]?.total).to.equal(4)
                    expect(message.flags?.transformations?.state).to.equal("rolled")
                    expect(message.flags?.transformations?.rollFormula).to.equal("2d6")
                    expect(message.flags?.transformations?.recoveryBudget).to.equal(4)
                    expect(chatCardHelper.hasButton({
                        text: "Roll"
                    })).to.equal(false)
                    chatCardHelper.assertButtonExists({
                        text: "Recover spell slots"
                    }, expect)

                    await message.update({
                        "flags.transformations.unbridledPowerRollPersistenceCheck": true
                    })
                    await waiters.waitForNextFrame()

                    expect(chatCardHelper.getPresentedRolls()[0]?.total).to.equal(4)

                    await GiftClass.actions.recoverSpellSlots({
                        actor,
                        message,
                        actorRepository,
                        dialogFactory,
                        ChatMessagePartInjector: runtime.ui.ChatMessagePartInjector,
                        GiftClass
                    })

                    expect(dialogCalls).to.have.length(1)
                    expect(dialogCalls[0]?.actor).to.equal(actor)
                    expect(dialogCalls[0]?.amount).to.equal(4)

                    await waiters.waitForCondition(() =>
                        actor.system.spells.spell1.value === 2 &&
                        actor.system.spells.spell2.value === 1
                    )
                    await waiters.waitForCondition(() =>
                        actor.system.attributes.hp.value === staticVars.initialHp - 8
                    )

                    expect(actor.system.spells.spell1.value).to.equal(2)
                    expect(actor.system.spells.spell2.value).to.equal(1)
                    expect(actor.system.spells.spell3.value).to.equal(1)
                    expect(actor.system.attributes.hp.value).to.equal(
                        staticVars.initialHp - 8
                    )
                    expect(
                        actor.items.get(staticVars.classItem.id)?.system?.hd?.value
                    ).to.equal(staticVars.initialHitDice - 2)
                    expect(message.flags?.transformations?.state).to.equal("complete")
                    expect(chatCardHelper.hasButton({
                        text: "Recover spell slots"
                    })).to.equal(false)

                    await message.update({
                        "flags.transformations.unbridledPowerCompletePersistenceCheck": true
                    })
                    await waiters.waitForNextFrame()

                    const persistedRolls = chatCardHelper.getPresentedRolls()
                    expect(persistedRolls).to.have.length(1)
                    expect(persistedRolls[0]?.formula).to.equal("2d6")
                    expect(persistedRolls[0]?.total).to.equal(4)
                } finally {
                    rollHelper.restore()
                }
            }
        },

        {
            name: `Gift of Unbridled Power keeps the rolled recovery state when the dialog closes`,

            setup: async ({actor, helpers, staticVars}) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                await setFiendStage3GiftChoices(actor)
            },

            requiredPath: [
                {
                    stage: 1
                },
                {
                    stage: 2
                },
                {
                    stage: 3
                },
                {
                    stage: 4,
                    choose: FIEND_STAGE_4_CHOICE_UUID
                }
            ],

            steps: [
                async ({actor, runtime, helpers, waiters, staticVars}) =>
                {
                    staticVars.classItem = await createCharacterClassWithHitDice({
                        actor,
                        helpers,
                        className: "Wizard",
                        hitDiceValue: 4,
                        levels: 20
                    })
                    staticVars.initialHitDice =
                        actor.items.get(staticVars.classItem.id)?.system?.hd?.value
                    staticVars.initialHp = actor.system.attributes.hp.value

                    await actor.update({
                        "system.spells.spell1.override": 2,
                        "system.spells.spell1.value": 0,
                        "system.spells.spell2.override": 1,
                        "system.spells.spell2.value": 0,
                        "system.spells.pact.max": 0,
                        "system.spells.pact.value": 0,
                        "system.spells.pact.level": 0
                    })

                    await prepareFiendUnbridledPowerClassChatCard({
                        actor,
                        runtime,
                        helpers,
                        waiters,
                        staticVars
                    })
                }
            ],

            assertions: async ({actor, runtime, expect, waiters, helpers, staticVars}) =>
            {
                const {
                          chatCardHelper,
                          message,
                          unbridledPowerGiftClass: GiftClass,
                          unbridledPowerActorRepository: actorRepository
                      } = staticVars
                const rollHelper = helpers.createDeterministicRollHelper()
                const dialogCalls = []
                const dialogFactory = {
                    async openFiendUnbridledPowerSpellSlotRecovery(args)
                    {
                        dialogCalls.push(args)
                        return null
                    }
                }

                try {
                    const card = chatCardHelper.getCardElement()

                    // expect(card, "Gift of Unbridled Power chat card should render").to.exist
                    expect(card.dataset.gift).to.equal("giftOfUnbridledPower")
                    chatCardHelper.assertButtonExists({
                        text: "Roll"
                    }, expect)

                    rollHelper.queueRoll({
                        formula: "2d6",
                        total: 5,
                        diceResults: [2, 3]
                    })

                    await GiftClass.actions.roll({
                        actor,
                        message,
                        actorRepository,
                        RollService,
                        ChatMessagePartInjector: runtime.ui.ChatMessagePartInjector,
                        GiftClass
                    })

                    await waiters.waitForCondition(() =>
                        rollHelper.getCalls().some(call =>
                            call.type === "roll" &&
                            call.formula === "2d6"
                        )
                    )

                    chatCardHelper.assertButtonExists({
                        text: "Recover spell slots"
                    }, expect)

                    await GiftClass.actions.recoverSpellSlots({
                        actor,
                        message,
                        actorRepository,
                        dialogFactory,
                        ChatMessagePartInjector: runtime.ui.ChatMessagePartInjector,
                        GiftClass
                    })

                    expect(dialogCalls).to.have.length(1)
                    expect(dialogCalls[0]?.actor).to.equal(actor)
                    expect(dialogCalls[0]?.amount).to.equal(5)

                    expect(actor.system.spells.spell1.value).to.equal(0)
                    expect(actor.system.spells.spell2.value).to.equal(0)
                    expect(actor.system.attributes.hp.value).to.equal(
                        staticVars.initialHp
                    )
                    expect(
                        actor.items.get(staticVars.classItem.id)?.system?.hd?.value
                    ).to.equal(staticVars.initialHitDice - 2)
                    expect(message.flags?.transformations?.state).to.equal("rolled")
                    expect(message.flags?.transformations?.recoveryBudget).to.equal(5)

                    await message.update({
                        "flags.transformations.unbridledPowerCancelPersistenceCheck": true
                    })
                    await waiters.waitForNextFrame()

                    chatCardHelper.assertButtonExists({
                        text: "Recover spell slots"
                    }, expect)
                    expect(chatCardHelper.getPresentedRolls()[0]?.formula).to.equal("2d6")
                    expect(chatCardHelper.getPresentedRolls()[0]?.total).to.equal(5)
                } finally {
                    rollHelper.restore()
                }
            }
        }
    ]
}
