import { Registry } from "../../bootstrap/registry.js"
import { giftsOfDamnation } from "../../domain/transformation/subclasses/fiend/giftsOfDamnation/index.js"
import { RollService } from "../../services/rolls/RollService.js"
import { ChatCardActionBinder } from "../../ui/chatCards/ChatCardActionBinder.js"
import { ChatMessagePartInjector } from "../../ui/chatCards/ChatMessagePartInjector.js"
import { wait } from "./wait.js"
import { waitFor } from "./waitFor.js"

const CARD_SELECTOR = "[data-transformations-card], .gift-of-damnation-card"

export function createChatCardTestHelper({
    message,
    gifts = giftsOfDamnation,
    logger = Registry.logger
} = {})
{
    function getMessage()
    {
        return game.messages?.get(message?.id) ?? message ?? null
    }

    function getLiveRoot()
    {
        const currentMessage = getMessage()
        const messageId = currentMessage?.id
        if (!messageId) return null

        return document.querySelector(
            `.chat-message[data-message-id="${messageId}"]`
        )
    }

    function createDetachedRoot()
    {
        const wrapper = document.createElement("div")
        wrapper.innerHTML = getMessage()?.content ?? ""
        return wrapper
    }

    function resolveRoot({preferLive = true} = {})
    {
        const detachedRoot = createDetachedRoot()
        if (!preferLive) return detachedRoot

        const liveRoot = getLiveRoot()
        if (!liveRoot) return detachedRoot

        const liveCard = findCard(liveRoot)
        const detachedCard = findCard(detachedRoot)

        if (!liveCard && detachedCard) return detachedRoot
        if (liveCard && !detachedCard) return liveRoot
        if (liveCard && detachedCard) {
            return normalizeHtml(liveCard.outerHTML) === normalizeHtml(detachedCard.outerHTML)
                ? liveRoot
                : detachedRoot
        }

        return liveRoot
    }

    function getCardElement({
        root = resolveRoot(),
        require = false
    } = {})
    {
        const card = findCard(root)

        if (card || !require) {
            return card ?? null
        }

        throw new Error(
            `Chat card not found for message ${getMessage()?.id ?? "unknown"}`
        )
    }

    function getCardHtml({
        root = resolveRoot()
    } = {})
    {
        return getCardElement({root})?.outerHTML ?? null
    }

    function getButtons({
        root = resolveRoot()
    } = {})
    {
        return Array.from(
            getCardElement({root})?.querySelectorAll("button") ?? []
        )
    }

    function hasButton(criteria = {})
    {
        return findButton(criteria) != null
    }

    function assertButtonExists(criteria = {}, expect)
    {
        const button = findButton(criteria)

        if (expect) {
            expect(
                button,
                createMissingButtonMessage(criteria)
            ).to.exist
        } else if (!button) {
            throw new Error(createMissingButtonMessage(criteria))
        }

        return button
    }

    async function waitForCard({
        timeout = 2000,
        preferLive = true
    } = {})
    {
        return waitFor({
            timeout,
            predicate: () =>
            {
                const root = resolveRoot({preferLive})
                return getCardElement({root}) || false
            },
            errorMessage:
                `Timed out waiting for chat card for message ${getMessage()?.id ?? "unknown"}`
        })
    }

    async function waitForButton(criteria = {}, {
        timeout = 2000,
        preferLive = true
    }                                     = {})
    {
        return waitFor({
            timeout,
            predicate: () =>
            {
                const root = resolveRoot({preferLive})
                const card = getCardElement({root})
                return card ? findButton(criteria, {card}) || false : false
            },
            errorMessage: createMissingButtonMessage(criteria)
        })
    }

    async function clickButton(criteria = {}, {
        timeout = 2000,
        preferLive = true
    }                                   = {})
    {
        await waitForCard({
            timeout,
            preferLive
        })

        const root = resolveRoot({preferLive})
        const card = getCardElement({
            root,
            require: true
        })

        bindCardIfNeeded(root)

        const button = findButton(criteria, {card})
        if (!button) {
            throw new Error(createMissingButtonMessage(criteria))
        }

        if (button.dataset.transformationsAction && card.dataset.gift) {
            await invokeTransformationsAction({
                root,
                card,
                button
            })
        } else {
            button.click()
        }

        await Promise.resolve()
        await wait(0)

        return button
    }

    function getPresentedRolls({
        root = resolveRoot()
    } = {})
    {
        const card = getCardElement({root})
        if (!card) return []

        return Array.from(card.querySelectorAll(".dice-roll"))
        .map(rollElement =>
        {
            const formula =
                      normalizeText(
                          rollElement.querySelector(".dice-formula")?.textContent
                      ) || null
            const damageType =
                      normalizeText(
                          rollElement.querySelector(".dice-flavor")?.textContent
                      ) || null
            const totalText =
                      normalizeText(
                          rollElement.querySelector(".dice-total")?.textContent
                      ) || null
            const totalNumber = Number(totalText)

            return {
                formula,
                damageType,
                total: Number.isFinite(totalNumber) ? totalNumber : totalText,
                tooltipHtml:
                    rollElement.querySelector(".dice-tooltip")?.outerHTML ?? null
            }
        })
    }

    function hasPresentedRolls({
        count = 1,
        root = resolveRoot()
    } = {})
    {
        return getPresentedRolls({root}).length >= count
    }

    async function waitForPresentedRolls({
        count = 1,
        timeout = 2000,
        preferLive = true
    } = {})
    {
        return waitFor({
            timeout,
            predicate: () =>
            {
                const root = resolveRoot({preferLive})
                const card = getCardElement({root})
                if (!card) return false

                const rolls = Array.from(card.querySelectorAll(".dice-roll"))
                return rolls.length >= count
                    ? getPresentedRolls({root})
                    : false
            },
            errorMessage:
                `Timed out waiting for ${count} presented roll(s) on message ${getMessage()?.id ?? "unknown"}`
        })
    }

    return Object.freeze({
        getMessage,
        getLiveRoot,
        createDetachedRoot,
        getCardElement,
        getCardHtml,
        getButtons,
        hasButton,
        assertButtonExists,
        waitForCard,
        waitForButton,
        clickButton,
        getPresentedRolls,
        hasPresentedRolls,
        waitForPresentedRolls
    })

    function findButton(criteria = {}, {
        card = getCardElement()
    }                            = {})
    {
        if (!card) return null

        const {
                  selector  = null,
                  text      = null,
                  className = null
              } = criteria ?? {}

        if (selector) {
            return card.querySelector(selector)
        }

        const buttons = Array.from(card.querySelectorAll("button"))
        if (!buttons.length) return null

        if (text != null) {
            const expectedText = normalizeText(text)
            return buttons.find(button =>
                normalizeText(button.textContent) === expectedText
            ) ?? null
        }

        if (className != null) {
            const normalizedClassName = String(className).replace(/^\./, "")

            return buttons.find(button =>
                button.classList.contains(normalizedClassName)
            ) ?? null
        }

        return buttons.length === 1 ? buttons[0] : null
    }

    function bindCardIfNeeded(root)
    {
        ChatCardActionBinder.bind({
            message: getMessage(),
            html: root,
            giftsOfDamnation: gifts,
            actorRepository: Registry.infrastructure?.actorRepository,
            ChatMessagePartInjector,
            RollService,
            logger
        })
    }

    async function invokeTransformationsAction({
        root,
        card,
        button
    })
    {
        const giftEntry = gifts.find(gift => gift.id === card.dataset.gift)
        const action = button.dataset.transformationsAction
        const GiftClass = giftEntry?.GiftClass

        if (!GiftClass?.actions?.[action]) {
            throw new Error(
                `Unknown transformations action "${action}" for gift "${card.dataset.gift}"`
            )
        }

        const actor = await resolveActorForAction({
            root,
            message: getMessage(),
            actorRepository: Registry.infrastructure?.actorRepository
        })

        if (!actor) {
            throw new Error(
                `Unable to resolve actor for transformations action "${action}"`
            )
        }

        await GiftClass.actions[action]({
            actor,
            message: getMessage(),
            element: button,
            actorRepository: Registry.infrastructure?.actorRepository,
            GiftClass,
            ChatMessagePartInjector,
            RollService,
            logger
        })
    }
}

export function createDeterministicRollHelper()
{
    const originalRoll = globalThis.Roll
    const originalSimpleRoll = RollService.simpleRoll.bind(RollService)
    const originalDice3d = game.dice3d
    const queuedRolls = []
    const calls = []

    RollService.simpleRoll = async function simpleRoll(formula)
    {
        calls.push({
            type: "construct",
            formula
        })
        calls.push({
            type: "roll",
            formula
        })

        const entry = takeQueuedRollEntry(queuedRolls, formula)
        if (!entry) {
            return originalSimpleRoll(formula)
        }

        return createMockRollResult({
            RollClass: originalRoll,
            ...entry,
            formula: entry.formula ?? formula
        })
    }

    game.dice3d = {
        async showForRoll() {}
    }

    return Object.freeze({
        queueRoll({
            formula = null,
            total,
            tooltip = null,
            diceResults = null,
            options = {},
            damageType = null
        })
        {
            queuedRolls.push({
                formula,
                total,
                tooltip,
                diceResults,
                options,
                damageType
            })
        },
        restore()
        {
            RollService.simpleRoll = originalSimpleRoll
            game.dice3d = originalDice3d
        },
        getCalls()
        {
            return [...calls]
        },
        getPending()
        {
            return [...queuedRolls]
        }
    })
}

function applyMockRollResult(roll, {
    formula,
    total,
    tooltip = null,
    diceResults = null,
    options = {},
    damageType = null
})
{
    const normalizedTotal = Number(total)
    const rollOptions = foundry.utils.deepClone(options ?? {})
    rollOptions.types ??= []

    if (damageType && !rollOptions.types.includes(damageType)) {
        rollOptions.types.push(damageType)
    }

    setRollTotal(roll, Number.isFinite(normalizedTotal) ? normalizedTotal : total)
    if (!roll.formula) {
        setOwnProperty(roll, "formula", formula)
    }
    setOwnProperty(roll, "options", rollOptions)
    setOwnProperty(roll, "dice", [{
        results: resolveDiceResults({
            formula,
            total: normalizedTotal,
            diceResults
        }).map(result => ({
            active: true,
            result
        }))
    }])
    roll._tooltip = tooltip ?? createDefaultTooltip({
        formula,
        total: roll.total
    })
    roll._damageType = damageType
    roll._evaluated = true
    roll.getTooltip = async function getTooltip()
    {
        return this._tooltip ?? createDefaultTooltip({
            formula: this.formula,
            total: this.total
        })
    }
    roll.toJSON = function toJSON()
    {
        return JSON.stringify({
            class: "Roll",
            formula: this.formula,
            total: this.total,
            evaluated: this._evaluated,
            options: foundry.utils.deepClone(this.options ?? {})
        })
    }
}

function takeQueuedRollEntry(queuedRolls, formula)
{
    const queueIndex = queuedRolls.findIndex(entry =>
        entry.formula == null || entry.formula === formula
    )

    if (queueIndex === -1) return null

    const [entry] = queuedRolls.splice(queueIndex, 1)
    return entry
}

function createMockRollResult({
    RollClass,
    formula,
    total,
    tooltip = null,
    diceResults = null,
    options = {},
    damageType = null
})
{
    const roll =
        typeof RollClass === "function"
            ? new RollClass(formula)
            : {}

    applyMockRollResult(roll, {
        formula,
        total,
        tooltip,
        diceResults,
        options,
        damageType
    })

    return roll
}

function setOwnProperty(target, key, value)
{
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: true,
        writable: true,
        value
    })
}

function setRollTotal(roll, total)
{
    setOwnProperty(roll, "total", total)
    roll._total = total
}

function resolveDiceResults({
    formula,
    total,
    diceResults
})
{
    if (Array.isArray(diceResults) && diceResults.length) {
        return diceResults
    }

    const [, diceCount = "1", dieSize = "20"] =
          String(formula ?? "").match(/(\d*)d(\d+)/i) ?? []
    const count = Number(diceCount || 1)
    const size = Number(dieSize || 20)
    const defaultValue = clampRollValue(total, size)

    return Array.from({length: Math.max(count, 1)}, () => defaultValue)
}

function clampRollValue(total, dieSize)
{
    if (!Number.isFinite(total)) return 1
    if (!Number.isFinite(dieSize) || dieSize <= 0) return total

    return Math.max(1, Math.min(total, dieSize))
}

function createMissingButtonMessage({
    selector = null,
    text = null,
    className = null
} = {})
{
    if (selector) {
        return `Chat card button not found for selector ${selector}`
    }

    if (text != null) {
        return `Chat card button not found with text "${text}"`
    }

    if (className != null) {
        return `Chat card button not found with class "${className}"`
    }

    return "Chat card button not found"
}

function normalizeText(value)
{
    return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeHtml(value)
{
    return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
}

function createDefaultTooltip({
    formula,
    total
})
{
    return [
        `<div class="dice-tooltip">`,
        `<section class="tooltip-part">`,
        `<div class="dice-formula">${formula}</div>`,
        `<h4 class="dice-total">${total}</h4>`,
        `</section>`,
        `</div>`
    ].join("")
}

function findCard(root)
{
    return root?.matches?.(CARD_SELECTOR)
        ? root
        : root?.querySelector?.(CARD_SELECTOR)
}

async function resolveActorForAction({
    root,
    message,
    actorRepository
})
{
    const messageActorId = message?.speaker?.actor
    if (messageActorId) {
        const actor = game.actors.get(messageActorId)
        if (actor) return actor
    }

    const chatCard = root?.querySelector?.(".chat-card") ?? root?.closest?.(".chat-card")
    const actorId = chatCard?.dataset?.actorId
    if (actorId) {
        const actor = game.actors.get(actorId)
        if (actor) return actor
    }

    const actorUuid = chatCard?.dataset?.actorUuid
    if (actorUuid) {
        const actor =
            typeof actorRepository?.getByUuid === "function"
                ? await actorRepository.getByUuid(actorUuid)
                : await fromUuid(actorUuid)

        if (actor) return actor
    }

    const itemUuid = message?.flags?.dnd5e?.item?.uuid
    if (itemUuid) {
        const item = await fromUuid(itemUuid)
        if (item?.actor) return item.actor
    }

    return null
}
