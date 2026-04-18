import {
    buildSyntheticActivityButton,
    injectSyntheticMidiActivityCard,
    renderSyntheticMidiActivityCard,
    replaceSyntheticMidiActivityCard,
    resolveSyntheticCardItem
} from "../../../../../ui/chatCards/SyntheticMidiActivityCard.js"

const DEFAULT_ICON = "icons/magic/unholy/hand-fire-skeleton-pink.webp"

export {
    buildSyntheticActivityButton
}

export async function renderGiftOfDamnationCard({
    actor,
    message,
    GiftClass,
    state,
    descriptionHtml = "",
    subtitle = "",
    supplements = [],
    buttons = [],
    roll = null,
    presentedRoll = null,
    presentedRolls = null
} = {})
{
    const item = await resolveSyntheticCardItem({
        actor,
        message,
        fallbackName: GiftClass?.label ?? "Gift of Damnation",
        fallbackImg: DEFAULT_ICON,
        fallbackUuid: GiftClass?.itemUuid ?? null
    })

    const resolvedPresentedRoll =
              presentedRoll ??
              message?.flags?.transformations?.presentedRoll ??
              null
    const resolvedPresentedRolls =
              presentedRolls ??
              message?.flags?.transformations?.presentedRolls ??
              null
    const renderedRollHtml =
              roll
                  ? ""
                  : resolvedPresentedRoll?.rendered ?? ""

    return renderSyntheticMidiActivityCard({
        actor,
        item,
        title: GiftClass?.label ?? "Gift of Damnation",
        activityName: "Gift of Damnation",
        displayActivityName: true,
        descriptionHtml:
            descriptionHtml || formatDescriptionHtml(GiftClass?.description ?? ""),
        subtitle,
        supplements,
        buttons,
        roll,
        renderedRollHtml,
        renderedRolls: mapPresentedRollsToRenderedSlots(resolvedPresentedRolls),
        dataset: {
            gift: GiftClass?.id ?? "",
            state
        },
        cardClass: "gift-of-damnation-card"
    })
}

export async function injectGiftOfDamnationCard({
    message,
    content
} = {})
{
    return injectSyntheticMidiActivityCard({
        message,
        content,
        selector: ".midi-buttons, .midi-dnd5e-buttons",
        position: "afterbegin"
    })
}

export async function replaceGiftOfDamnationCard({
    GiftClass,
    message,
    content
} = {})
{
    const selector = [
        ".gift-of-damnation-card",
        `[data-transformations-card][data-gift='${GiftClass?.id ?? ""}']`
    ].join(", ")

    return replaceSyntheticMidiActivityCard({
        message,
        content,
        selector
    })
}

export async function buildPresentedRollData(roll, {
    formula = null,
    damageType = null,
    slot = "utility"
} = {})
{
    if (!roll) return null

    return {
        total: roll.total,
        formula,
        damageType,
        slot,
        rendered: await roll.render()
    }
}

export function formatDescriptionHtml(description)
{
    const text = String(description ?? "").trim()
    if (!text) return "<p></p>"

    return text
    .split(/\n\s*\n/)
    .map(paragraph =>
        `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`
    )
    .join("")
}

function escapeHtml(value)
{
    return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function mapPresentedRollsToRenderedSlots(presentedRolls)
{
    if (!presentedRolls) return null

    const renderedSlots = {}

    if (Array.isArray(presentedRolls)) {
        const defaultSlots =
                  presentedRolls.length > 1
                      ? ["attack", "damage"]
                      : ["utility"]

        for (const [index, entry] of presentedRolls.entries()) {
            const slot = entry?.slot ?? defaultSlots[index] ?? "utility"
            if (!entry?.rendered) continue

            renderedSlots[slot] = entry.rendered
        }

        return renderedSlots
    }

    for (const [key, entry] of Object.entries(presentedRolls)) {
        if (!entry?.rendered) continue

        const slot = entry.slot ?? key
        renderedSlots[slot] = entry.rendered
    }

    return renderedSlots
}
