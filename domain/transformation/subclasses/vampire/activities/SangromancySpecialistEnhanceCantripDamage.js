import {
    buildSyntheticActivityButton,
    injectSyntheticMidiActivityCard,
    renderSyntheticMidiActivityCard,
    replaceSyntheticMidiActivityCard,
    resolveHtmlRoot,
    resolveSyntheticCardItem
} from "../../../../../ui/chatCards/SyntheticMidiActivityCard.js"

const CARD_SELECTOR =
          "[data-transformations-card][data-vampire-activity='sangromancyEnhanceCantripDamage']"
const CARD_TITLE = "Enhance Cantrip Damage"
const CARD_ICON =
          "modules/transformations/Icons/Transformations/Vampire/Sangromancy%20Specialist.png"
const SANGROMANCY_ITEM_UUID =
          "Compendium.transformations.gh-transformations.Item.qmepd5HkL0LpxOJv"
const SANGROMANCY_FLAG_SCOPE = "transformations"
const SANGROMANCY_FLAG_KEY = "vampire.sangromancyHitDieMax"
const MAX_ROLLABLE_DICE = 2

export class SangromancySpecialistEnhanceCantripDamage
{
    static id = "sangromancyEnhanceCantripDamage"
    static activityId = "enhanceCantripDamage"
    static activityName = CARD_TITLE
    static itemSourceUuid = SANGROMANCY_ITEM_UUID

    static matchesActivity({
        activity,
        usage = null,
        item = this.resolveItem({
            activity,
            usage
        })
    } = {})
    {
        return this.matchesItem(item) &&
            this.resolveActivityName(activity, usage) === this.activityName
    }

    static matchesItem(item)
    {
        return resolveSourceUuid(item) === this.itemSourceUuid
    }

    static resolveItem({
        activity,
        usage = null
    } = {})
    {
        return usage?.workflow?.item ??
            usage?.item ??
            activity?.item ??
            activity?.parent?.parent ??
            activity?.parent ??
            null
    }

    static resolveActivityName(activity, usage = null)
    {
        return usage?.workflow?.activity?.name ??
            usage?.activity?.name ??
            activity?.name ??
            ""
    }

    static async ensureActivity(item)
    {
        if (!this.matchesItem(item) || typeof item?.update !== "function") {
            return null
        }

        const existingActivity = this.findActivity(item)
        if (existingActivity) {
            return existingActivity
        }

        await item.update({
            [`system.activities.${this.activityId}`]:
                this.buildActivityData()
        })

        return this.findActivity(item)
    }

    static findActivity(item)
    {
        return resolveActivities(item).find(activity =>
            activity?.id === this.activityId ||
            activity?._id === this.activityId ||
            activity?.name === this.activityName
        ) ?? null
    }

    static async activityUse({
        actor,
        item,
        message,
        actorRepository,
        ChatMessagePartInjector
    } = {})
    {
        if (!actor || !item || !message || !ChatMessagePartInjector) {
            this.warn("Skipping Sangromancy activity use: missing actor, item, message, or injector")
            return
        }

        const resourceState = this.getResourceState({
            actor,
            item,
            actorRepository
        })

        if (resourceState.maxDice <= 0) {
            this.warn("Skipping Sangromancy activity use: no available charges or hit dice", {
                actorId: actor?.id ?? null,
                itemId: item?.id ?? null
            })
            return
        }

        await message.update({
            "flags.transformations.vampireActivity": this.id,
            "flags.transformations.state": "initial",
            "flags.transformations.maxDice": resourceState.maxDice,
            "flags.transformations.totalAvailableDice":
                resourceState.totalAvailableDice,
            "flags.transformations.itemChargesAvailable":
                resourceState.itemChargesAvailable,
            "flags.transformations.classHitDiceAvailable":
                resourceState.classHitDiceAvailable,
            "flags.transformations.highestClassHitDie":
                resourceState.highestClassHitDie
        })

        void ChatMessagePartInjector

        await injectSyntheticMidiActivityCard({
            message,
            content: await this.renderCard({
                actor,
                item,
                message,
                state: "initial"
            }),
            selector: ".midi-buttons, .midi-dnd5e-buttons",
            position: "afterbegin"
        })
    }

    static bind({
        actor,
        message,
        html,
        actorRepository,
        ChatMessagePartInjector,
        RollService,
        logger
    } = {})
    {
        const root = resolveHtmlRoot(html)
        if (!root) return

        const card = root.matches?.(CARD_SELECTOR)
            ? root
            : root.querySelector?.(CARD_SELECTOR)
        if (!card) return

        if (card.dataset.vampireActivity !== this.id) return

        if (card.dataset.bound === "true") return
        card.dataset.bound = "true"

        card.addEventListener("click", async event =>
        {
            const button = event.target.closest("[data-transformations-action='rollDamage']")
            if (!button) return

            event.preventDefault()
            event.stopPropagation()

            const item = this.resolveItemFromMessage({
                actor,
                message
            })
            if (!item) {
                this.warn("Sangromancy roll aborted: item missing on actor", {
                    actorId: actor?.id ?? null
                })
                return
            }

            button.disabled = true

            logger?.debug?.("SangromancySpecialistEnhanceCantripDamage.bind.rollDamage", {
                actor,
                message,
                requestedDiceCount: button.dataset?.diceCount ?? null
            })

            const didRoll = await this.rollDamage({
                actor,
                item,
                message,
                actorRepository,
                ChatMessagePartInjector,
                RollService,
                requestedDiceCount: button.dataset?.diceCount
            })

            if (!didRoll) {
                button.disabled = false
            }
        })
    }

    static resolveItemFromMessage({
        actor,
        message
    } = {})
    {
        const itemUuid = message?.flags?.dnd5e?.item?.uuid ?? null

        if (itemUuid) {
            const byUuid = actor?.items?.find(item =>
                item?.uuid === itemUuid
            )
            if (byUuid) return byUuid
        }

        return actor?.items?.find(item =>
            this.matchesItem(item)
        ) ?? null
    }

    static async rollDamage({
        actor,
        item,
        message,
        actorRepository,
        ChatMessagePartInjector,
        RollService,
        requestedDiceCount
    } = {})
    {
        if (
            !actor ||
            !item ||
            !message ||
            !actorRepository ||
            !ChatMessagePartInjector ||
            !RollService
        ) {
            this.warn("Skipping Sangromancy damage roll: missing dependencies")
            return false
        }

        const rollPlan = this.buildRollPlan({
            actor,
            item,
            actorRepository,
            requestedDiceCount
        })
        if (!rollPlan) {
            this.warn("Skipping Sangromancy damage roll: no valid spend plan", {
                requestedDiceCount
            })
            return false
        }

        if (rollPlan.itemChargesSpent > 0) {
            const consumedCharges = await this.consumeItemCharges({
                actor,
                item,
                amount: rollPlan.itemChargesSpent
            })

            if (!consumedCharges) {
                this.warn("Failed Sangromancy charge consumption", {
                    actorId: actor?.id ?? null,
                    itemId: item?.id ?? null,
                    amount: rollPlan.itemChargesSpent
                })
                return false
            }
        }

        if (rollPlan.classHitDiceSpent > 0) {
            await actorRepository.consumeHitDie(
                actor,
                rollPlan.classHitDiceSpent
            )
        }

        const roll = await RollService.simpleRoll(rollPlan.formula)
        roll.options ??= {}
        roll.options.type = "damage"

        await message.update({
            "flags.transformations.state": "rolled",
            "flags.transformations.rollFormula": rollPlan.formula,
            "flags.transformations.requestedDiceCount": rollPlan.diceCount,
            "flags.transformations.itemChargesSpent":
                rollPlan.itemChargesSpent,
            "flags.transformations.classHitDiceSpent":
                rollPlan.classHitDiceSpent,
            "flags.transformations.highestClassHitDie":
                rollPlan.highestClassHitDie
        })

        void ChatMessagePartInjector

        await replaceSyntheticMidiActivityCard({
            message,
            content: await this.renderCard({
                actor,
                item,
                message,
                state: "rolled",
                roll
            }),
            selector: CARD_SELECTOR
        })

        return true
    }

    static getResourceState({
        actor,
        item,
        actorRepository
    } = {})
    {
        const itemChargesAvailable = this.getAvailableItemCharges({
            actor,
            item
        })
        const availableClassHitDice = getAvailableClassHitDice(actor)
        const classHitDiceAvailable = availableClassHitDice.reduce(
            (total, entry) => total + entry.value,
            0
        )
        const highestClassHitDie =
                  getHighestClassHitDieDenomination(actor) ??
                  actorRepository?.getHighestAvailableHitDice?.(actor)?.denomination ??
                  null
        const usableItemCharges = highestClassHitDie
            ? itemChargesAvailable
            : 0
        const totalAvailableDice = usableItemCharges + classHitDiceAvailable
        const maxDice = Math.min(totalAvailableDice, MAX_ROLLABLE_DICE)

        return {
            itemChargesAvailable,
            usableItemCharges,
            availableClassHitDice,
            classHitDiceAvailable,
            highestClassHitDie,
            totalAvailableDice,
            maxDice
        }
    }

    static buildRollPlan({
        actor,
        item,
        actorRepository,
        requestedDiceCount
    } = {})
    {
        const resourceState = this.getResourceState({
            actor,
            item,
            actorRepository
        })
        const normalizedDiceCount = normalizeRequestedDiceCount(
            requestedDiceCount,
            resourceState.totalAvailableDice
        )
        if (normalizedDiceCount <= 0) return null

        const itemChargesSpent = Math.min(
            resourceState.usableItemCharges,
            normalizedDiceCount
        )
        const classHitDiceSpent = Math.max(
            normalizedDiceCount - itemChargesSpent,
            0
        )
        const rolledDenominations = [
            ...Array.from({
                length: itemChargesSpent
            }, () => resourceState.highestClassHitDie),
            ...consumeClassHitDicePreview(
                resourceState.availableClassHitDice,
                classHitDiceSpent
            )
        ]
        .filter(Boolean)

        if (
            rolledDenominations.length !== normalizedDiceCount ||
            (
                itemChargesSpent > 0 &&
                !resourceState.highestClassHitDie
            )
        ) {
            return null
        }

        return {
            diceCount: normalizedDiceCount,
            itemChargesSpent,
            classHitDiceSpent,
            highestClassHitDie: resourceState.highestClassHitDie,
            rolledDenominations,
            formula: buildFormulaFromDenominations(rolledDenominations)
        }
    }

    static getAvailableItemCharges({
        actor,
        item
    } = {})
    {
        const uses = item?.system?.uses ?? {}
        const numericValue = Number(uses?.value)
        if (Number.isFinite(numericValue)) {
            return Math.max(numericValue, 0)
        }

        const numericSpent = Number(uses?.spent)
        const numericMax = Number(uses?.max)
        if (Number.isFinite(numericMax)) {
            return Math.max(numericMax - (Number.isFinite(numericSpent) ? numericSpent : 0), 0)
        }

        const flagMax = Number(
            actor?.getFlag?.(SANGROMANCY_FLAG_SCOPE, SANGROMANCY_FLAG_KEY) ??
            actor?.flags?.transformations?.vampire?.sangromancyHitDieMax ??
            null
        )
        if (!Number.isFinite(flagMax)) {
            return 0
        }

        return Math.max(
            flagMax - (Number.isFinite(numericSpent) ? numericSpent : 0),
            0
        )
    }

    static async consumeItemCharges({
        actor,
        item,
        amount
    } = {})
    {
        const numericAmount = Math.max(Number(amount ?? 0), 0)
        if (!item || numericAmount <= 0) return true

        const currentCharges = this.getAvailableItemCharges({
            actor,
            item
        })
        if (currentCharges < numericAmount) {
            return false
        }

        const currentSpent = Math.max(Number(item.system?.uses?.spent ?? 0), 0)
        const currentValue = Number(item.system?.uses?.value)
        const update = {
            "system.uses.spent": currentSpent + numericAmount
        }

        if (Number.isFinite(currentValue)) {
            update["system.uses.value"] = Math.max(
                currentValue - numericAmount,
                0
            )
        }

        await item.update(update)
        return true
    }

    static async renderCard({
        actor,
        item,
        message,
        state,
        roll = null
    } = {})
    {
        const resourceState = this.getResourceState({
            actor,
            item
        })
        const requestedDiceCount =
                  Number(message?.flags?.transformations?.requestedDiceCount ?? 0)
        const rollFormula =
                  message?.flags?.transformations?.rollFormula ??
                  this.buildRollPlan({
                      actor,
                      item,
                      requestedDiceCount: 1
                  })?.formula ??
                  null
        const itemDocument = await resolveSyntheticCardItem({
            actor,
            message,
            fallbackName: CARD_TITLE,
            fallbackImg: item?.img ?? CARD_ICON,
            fallbackUuid: item?.uuid ?? this.itemSourceUuid
        })

        return renderSyntheticMidiActivityCard({
            actor,
            item: itemDocument,
            title: CARD_TITLE,
            activityName: CARD_TITLE,
            displayActivityName: true,
            descriptionHtml: this.buildDescriptionHtml(),
            subtitle: this.buildSubtitle({
                state,
                requestedDiceCount,
                rollFormula,
                roll
            }),
            supplements: this.buildSupplements({
                actor,
                item,
                state,
                resourceState,
                requestedDiceCount,
                rollFormula,
                roll
            }),
            buttons: this.buildButtons({
                actor,
                item,
                state,
                resourceState
            }),
            roll,
            dataset: {
                vampireActivity: this.id,
                state
            },
            cardClass: "vampire-sangromancy-enhance-cantrip-damage-card"
        })
    }

    static buildButtons({
        actor,
        item,
        state,
        resourceState = this.getResourceState({
            actor,
            item
        })
    } = {})
    {
        if (state !== "initial") return []

        const buttons = []

        for (let diceCount = 1; diceCount <= resourceState.maxDice; diceCount++) {
            const rollPlan = this.buildRollPlan({
                actor,
                item,
                requestedDiceCount: diceCount
            })
            if (!rollPlan) continue

            buttons.push(buildSyntheticActivityButton({
                action: "rollDamage",
                label: diceCount === 1
                    ? "Roll 1 Die"
                    : `Roll ${diceCount} Dice`,
                dataset: {
                    diceCount: String(diceCount)
                }
            }))
        }

        return buttons
    }

    static buildDescriptionHtml()
    {
        return [
            "<p>Spend up to 2 Sangromancy charges or class Hit Dice to enhance your cantrip damage.</p>",
            "<p>Sangromancy charges are spent first and roll using your highest class Hit Die denomination.</p>"
        ].join("")
    }

    static buildSubtitle({
        state,
        requestedDiceCount,
        rollFormula,
        roll
    } = {})
    {
        if (state === "rolled" && roll) {
            return `Enhanced Damage: ${rollFormula ?? `${requestedDiceCount} die`}`
        }

        return "Roll up to 2 dice"
    }

    static buildSupplements({
        actor,
        item,
        state,
        resourceState,
        requestedDiceCount,
        rollFormula,
        roll
    } = {})
    {
        const supplements = [
            `Sangromancy charges available: <strong>${resourceState.itemChargesAvailable}</strong>.`,
            `Class Hit Dice available: <strong>${resourceState.classHitDiceAvailable}</strong>.`
        ]

        if (resourceState.highestClassHitDie) {
            supplements.push(
                `Item charges roll as <strong>${resourceState.highestClassHitDie}</strong>.`
            )
        }

        if (state === "rolled" && roll) {
            supplements.push(
                `Rolled <strong>${rollFormula ?? requestedDiceCount}</strong> for <strong>${roll.total}</strong> damage.`
            )

            return supplements
        }

        for (let diceCount = 1; diceCount <= resourceState.maxDice; diceCount++) {
            const rollPlan = this.buildRollPlan({
                actor,
                item,
                requestedDiceCount: diceCount
            })
            if (!rollPlan) continue

            supplements.push(
                `Roll ${diceCount} ${diceCount === 1 ? "die" : "dice"}: <strong>${rollPlan.formula}</strong>.`
            )
        }

        if (resourceState.maxDice === 0) {
            supplements.push("No Sangromancy charges or Hit Dice are available.")
        }

        return supplements
    }

    static buildActivityData()
    {
        return {
            _id: this.activityId,
            type: "utility",
            name: this.activityName,
            sort: 0,
            activation: {
                type: "special",
                override: false,
                condition: ""
            },
            consumption: {
                scaling: {
                    allowed: false
                },
                spellSlot: true,
                targets: []
            },
            description: {
                chatFlavor: ""
            },
            duration: {
                units: "inst",
                concentration: false,
                override: false
            },
            effects: [],
            flags: {
                transformations: {
                    vampireActivity: this.id
                }
            },
            range: {
                units: "self",
                override: false,
                special: ""
            },
            target: {
                template: {
                    contiguous: false,
                    units: "ft",
                    type: ""
                },
                affects: {
                    choice: false,
                    type: "self",
                    special: ""
                },
                override: false,
                prompt: false
            },
            uses: {
                spent: 0,
                recovery: [],
                max: ""
            },
            visibility: {
                level: {
                    min: null,
                    max: null
                },
                requireAttunement: false,
                requireIdentification: false,
                requireMagic: false,
                identifier: ""
            },
            roll: {
                prompt: false,
                visible: false,
                name: "",
                formula: ""
            },
            useConditionText: "",
            useConditionReason: "",
            effectConditionText: "",
            macroData: {
                name: "",
                command: ""
            },
            ignoreTraits: {
                idi: false,
                idr: false,
                idv: false,
                ida: false,
                idm: false
            },
            midiProperties: {
                ignoreTraits: [],
                triggeredActivityId: "none",
                triggeredActivityConditionText: "",
                triggeredActivityTargets: "targets",
                triggeredActivityRollAs: "self",
                triggeredActivityConsume: true,
                triggeredActivityConfigure: true,
                autoConsume: false,
                forceConsumeDialog: "default",
                forceRollDialog: "default",
                forceDamageDialog: "default",
                confirmTargets: "default",
                autoTargetType: "any",
                autoTargetAction: "default",
                automationOnly: false,
                otherActivityCompatible: true,
                otherActivityAsParentType: true,
                identifier: "",
                displayActivityName: false,
                rollMode: "default",
                chooseEffects: false,
                toggleEffect: false,
                ignoreFullCover: false,
                removeChatButtons: "default",
                magicEffect: false,
                magicDamage: false,
                noConcentrationCheck: false,
                skipConcentrationCheck: false,
                autoCEEffects: "default"
            },
            isOverTimeFlag: false,
            overTimeProperties: {
                saveRemoves: true,
                rollAs: "target",
                preRemoveConditionText: "",
                postRemoveConditionText: ""
            },
            otherActivityId: "none",
            otherActivityAsParentType: true
        }
    }

    static warn(message, details = null)
    {
        if (details == null) {
            console.warn(`Transformations | Sangromancy Specialist: ${message}`)
            return
        }

        console.warn(`Transformations | Sangromancy Specialist: ${message}`, details)
    }
}

function resolveActivities(item)
{
    const activities = item?.system?.activities
    if (!activities) return []

    if (Array.isArray(activities)) {
        return activities.filter(Boolean)
    }

    if (Array.isArray(activities?.contents)) {
        return activities.contents.filter(Boolean)
    }

    if (typeof activities?.values === "function") {
        return Array.from(activities.values()).filter(Boolean)
    }

    if (typeof activities?.[Symbol.iterator] === "function") {
        return Array.from(activities).filter(Boolean)
    }

    return Object.values(activities).filter(Boolean)
}

function resolveSourceUuid(document)
{
    return document?.flags?.transformations?.sourceUuid ??
        document?.flags?.core?.sourceId ??
        document?._stats?.compendiumSource ??
        document?.uuid ??
        null
}

function getAvailableClassHitDice(actor)
{
    return actor?.items
        ?.filter(item =>
            item?.type === "class" &&
            Number(item.system?.hd?.value ?? 0) > 0
        )
        ?.map(item => ({
            itemId: item.id,
            denomination: item.system?.hd?.denomination ?? null,
            value: Math.max(Number(item.system?.hd?.value ?? 0), 0)
        }))
        ?.filter(entry =>
            Boolean(entry.denomination) && entry.value > 0
        )
        ?.sort((left, right) =>
            getHitDieSize(right.denomination) - getHitDieSize(left.denomination)
        ) ?? []
}

function getHighestClassHitDieDenomination(actor)
{
    const classHitDice = actor?.items
        ?.filter(item => item?.type === "class")
        ?.map(item => item.system?.hd?.denomination)
        ?.filter(Boolean)
        ?.sort((left, right) =>
            getHitDieSize(right) - getHitDieSize(left)
        ) ?? []

    return classHitDice[0] ?? null
}

function consumeClassHitDicePreview(availableClassHitDice, amount)
{
    let remaining = Math.max(Number(amount ?? 0), 0)
    const rolledDenominations = []

    for (const entry of availableClassHitDice ?? []) {
        if (remaining <= 0) break

        const spend = Math.min(entry.value, remaining)
        remaining -= spend

        for (let index = 0; index < spend; index++) {
            rolledDenominations.push(entry.denomination)
        }
    }

    return rolledDenominations
}

function buildFormulaFromDenominations(denominations = [])
{
    if (!denominations.length) return ""

    const groupedParts = []
    let currentDenomination = null
    let currentCount = 0

    for (const denomination of denominations) {
        if (!denomination) continue

        if (currentDenomination === denomination) {
            currentCount += 1
            continue
        }

        if (currentDenomination) {
            groupedParts.push(`${currentCount}${currentDenomination}`)
        }

        currentDenomination = denomination
        currentCount = 1
    }

    if (currentDenomination) {
        groupedParts.push(`${currentCount}${currentDenomination}`)
    }

    return groupedParts.join(" + ")
}

function normalizeRequestedDiceCount(requestedDiceCount, totalAvailableDice)
{
    const numericRequest = Number(requestedDiceCount ?? 0)

    if (!Number.isFinite(numericRequest)) {
        return 0
    }

    return Math.max(
        Math.min(
            Math.floor(numericRequest),
            Math.max(Number(totalAvailableDice ?? 0), 0),
            MAX_ROLLABLE_DICE
        ),
        0
    )
}

function getHitDieSize(denomination)
{
    const numericValue = Number.parseInt(
        String(denomination ?? "d0").replace("d", ""),
        10
    )

    return Number.isFinite(numericValue) ? numericValue : 0
}
