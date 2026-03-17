export class ChatCardActionBinder {

    static bind({
        message,
        html,
        giftsOfDamnation,
        actorRepository,
        ChatMessagePartInjector,
        RollService,
        logger
    })
    {

        const card = html.querySelector("[data-transformations-card]")
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

            const actor = game.actors.get(message.speaker.actor)
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
                GiftClass,
                ChatMessagePartInjector,
                RollService,
                logger
            })

        })
    }
}
