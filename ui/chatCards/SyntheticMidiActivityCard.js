const TEMPLATE_PATH = "modules/midi-qol/templates/activity-card.hbs"
const DEFAULT_IMAGE = "icons/svg/d20-highlight.svg"

export function buildSyntheticActivityButton({
    action,
    label,
    icon = "",
    dataset = {},
    disabled = false
} = {})
{
    return {
        icon,
        label,
        isDisabled: disabled ? "disabled" : "",
        dataset: {
            ...dataset,
            transformationsAction: action
        }
    }
}

export async function renderSyntheticMidiActivityCard({
    actor,
    item,
    title,
    activityName = "",
    displayActivityName = false,
    descriptionHtml = "",
    subtitle = "",
    supplements = [],
    buttons = [],
    roll = null,
    renderedRollHtml = "",
    renderedRolls = null,
    dataset = {},
    cardClass = null,
    displayChallenge = false,
    hideItemDetails = false
} = {})
{
    const resolvedItem = normalizeItemData({
        actor,
        item,
        title
    })

    const templateData = {
        actor: {
            id: actor?.id ?? "",
            uuid: actor?.uuid ?? ""
        },
        item: resolvedItem,
        activity: {
            name: activityName || title || resolvedItem.name,
            midiProperties: {
                displayActivityName
            }
        },
        description: {
            concealed: false,
            chat: descriptionHtml || "<p></p>"
        },
        subtitle,
        hasButtons: true,
        hasAttack: false,
        hasDamage: false,
        hasEffects: false,
        hasAttackRoll: false,
        confirmAttackDamage: false,
        condensed: false,
        mergeCardMulti: false,
        hideItemDetails,
        displayProperties: false,
        properties: [],
        supplements,
        buttons
    }

    const rendered =
              await foundry.applications.handlebars.renderTemplate(
                  TEMPLATE_PATH,
                  templateData
              )

    const wrapper = document.createElement("div")
    wrapper.innerHTML = rendered.trim()

    const card = wrapper.firstElementChild
    if (!card) return rendered

    card.dataset.transformationsCard = "true"

    for (const [key, value] of Object.entries(dataset ?? {})) {
        if (value == null) continue
        card.dataset[key] = String(value)
    }

    if (displayChallenge) {
        card.dataset.displayChallenge = ""
    }

    const classNames = Array.isArray(cardClass)
        ? cardClass
        : [cardClass]
    for (const className of classNames) {
        if (!className) continue
        card.classList.add(className)
    }

    const resolvedRenderedRolls = await resolveRenderedRolls({
        roll,
        renderedRollHtml,
        renderedRolls
    })

    for (const [slot, html] of Object.entries(resolvedRenderedRolls)) {
        setRenderedRollSlot(card, slot, html)
    }

    return card.outerHTML
}

export async function injectSyntheticMidiActivityCard({
    message,
    content,
    selector = ".midi-buttons, .midi-dnd5e-buttons",
    position = "afterbegin"
} = {})
{
    if (!message || !content) return false

    const wrapper = document.createElement("div")
    wrapper.innerHTML = message.content

    const target = wrapper.querySelector(selector)
    if (!target) return false

    target.insertAdjacentHTML(position, content)

    await message.update({
        content: wrapper.innerHTML
    })

    return true
}

export async function replaceSyntheticMidiActivityCard({
    message,
    content,
    selector = "[data-transformations-card]"
} = {})
{
    if (!message || !content) return false

    const wrapper = document.createElement("div")
    wrapper.innerHTML = message.content

    const target = wrapper.querySelector(selector)
    if (!target) {
        await message.update({content})
        return true
    }

    target.outerHTML = content

    await message.update({
        content: wrapper.innerHTML
    })

    return true
}

export async function resolveSyntheticCardItem({
    actor,
    message,
    fallbackName,
    fallbackImg = DEFAULT_IMAGE,
    fallbackUuid = null
} = {})
{
    const itemUuid = message?.flags?.dnd5e?.item?.uuid ?? fallbackUuid
    const resolver =
              globalThis.fromUuid ??
              (typeof fromUuid === "function" ? fromUuid : null)

    if (resolver && itemUuid) {
        try {
            const item = await resolver(itemUuid)
            if (item) return item
        } catch (_error) {
            void _error
        }
    }

    return {
        id: "synthetic-activity",
        uuid: itemUuid ?? actor?.uuid ?? "",
        img: fallbackImg,
        name: fallbackName ?? "Activity",
        system: {
            level: 0
        }
    }
}

export function resolveHtmlRoot(html)
{
    if (!html) return null
    if (typeof html.querySelector === "function") return html
    if (typeof html[0]?.querySelector === "function") return html[0]
    return null
}

async function resolveRenderedRolls({
    roll,
    renderedRollHtml,
    renderedRolls
} = {})
{
    const resolved = {}

    for (const [slot, content] of Object.entries(renderedRolls ?? {})) {
        const html = await renderRollContent(content)
        if (!html) continue

        resolved[slot] = html
    }

    if (!resolved.utility) {
        const utilityHtml = await renderRollContent(roll ?? renderedRollHtml)
        if (utilityHtml) {
            resolved.utility = utilityHtml
        }
    }

    return resolved
}

async function renderRollContent(content)
{
    if (!content) return ""
    if (typeof content === "string") return content
    if (typeof content.render === "function") return content.render()
    if (typeof content.rendered === "string") return content.rendered
    return ""
}

function setRenderedRollSlot(card, slot, html)
{
    const selector = ROLL_SLOT_SELECTORS[slot]
    if (!selector || !html) return

    const container = card.querySelector(selector)
    if (!container) return

    container.innerHTML = html
}

function normalizeItemData({
    actor,
    item,
    title
} = {})
{
    return {
        id: item?.id ?? "synthetic-activity",
        uuid: item?.uuid ?? actor?.uuid ?? "",
        img: item?.img ?? DEFAULT_IMAGE,
        name: item?.name ?? title ?? "Activity",
        system: {
            level: item?.system?.level ?? 0
        }
    }
}

const ROLL_SLOT_SELECTORS = {
    attack: ".end-midi-qol-attack-roll",
    damage: ".end-midi-qol-damage-roll",
    otherDamage: ".end-midi-qol-other-damage-roll",
    bonusDamage: ".end-midi-qol-bonus-bonus-roll",
    utility: ".end-midi-qol-utility-roll",
    hits: ".end-midi-qol-hits-display",
    saves: ".end-midi-qol-saves-display"
}
