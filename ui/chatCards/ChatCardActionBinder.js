export class ChatCardActionBinder {

    static bind({
        message,
        html,
        giftsOfDamnation,
        actorRepository,
        dialogFactory,
        ChatMessagePartInjector,
        RollService,
        logger
    })
    {
        const root = resolveHtmlRoot(html)
        if (!root) return

        const card = root.matches?.(CARD_SELECTOR)
            ? root
            : root.querySelector?.(CARD_SELECTOR)
        if (!card) return

        const giftId = card.dataset.gift
        if (!giftId) return

        const giftEntry = giftsOfDamnation.find(g => g.id === giftId)
        if (!giftEntry) return

        const GiftClass = giftEntry.GiftClass

        // Prevent duplicate listeners if the message re-renders
        if (card.dataset.bound === "true") return
        card.dataset.bound = "true"

        card.addEventListener("click", async ev => {

            const button = ev.target.closest("[data-transformations-action]")
            if (!button) return

            ev.preventDefault()
            ev.stopPropagation()

            const action = button.dataset.transformationsAction

            if (!GiftClass?.actions?.[action]) {
                logger?.warn?.("Unknown gift action", {action, giftId})
                return
            }

            const actor = await resolveActor({
                message,
                button,
                actorRepository
            })
            if (!actor) return

            logger?.debug?.("Gift action triggered", {
                giftId,
                action
            })

            await GiftClass.actions[action]({
                actor,
                message,
                element: button,
                actorRepository,
                dialogFactory,
                GiftClass,
                ChatMessagePartInjector,
                RollService,
                logger
            })

        })
    }
}

function resolveHtmlRoot(html)
{
    if (!html) return null
    if (typeof html.querySelector === "function") return html
    if (typeof html[0]?.querySelector === "function") return html[0]
    return null
}

async function resolveActor({
    message,
    button,
    actorRepository
})
{
    const messageActorId = message?.speaker?.actor
    if (messageActorId) {
        const actor = game.actors.get(messageActorId)
        if (actor) return actor
    }

    const chatCard = button?.closest?.(".chat-card")
    const cardActorId = chatCard?.dataset?.actorId
    if (cardActorId) {
        const actor = game.actors.get(cardActorId)
        if (actor) return actor
    }

    const cardActorUuid = chatCard?.dataset?.actorUuid
    if (cardActorUuid) {
        const actor =
            typeof actorRepository?.getByUuid === "function"
                ? await actorRepository.getByUuid(cardActorUuid)
                : await fromUuid(cardActorUuid)

        if (actor) return actor
    }

    const itemUuid = message?.flags?.dnd5e?.item?.uuid
    if (itemUuid) {
        const item = await fromUuid(itemUuid)
        const actor = item?.actor ?? null
        if (actor) return actor
    }

    return null
}

const CARD_SELECTOR = "[data-transformations-card], .gift-of-damnation-card"
