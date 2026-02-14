// services/actions/chat.js

import { interpolate } from "../utils/interpolate.js"

export function createChatAction({
    tracker,
    logger
})
{
    logger.debug("createChatAction", { tracker })

    return async function CHAT({
        actor,
        action,
        context,
        variables
    })
    {
        logger.debug("createChatAction.CHAT", {
            actor,
            action,
            context,
            variables
        })
        const template = action.data?.message
        if (!template) return

        return tracker.track(
            (async () =>
            {
                const message = interpolate(template, {
                    actor,
                    transformation: context.transformation,
                    variables
                })

                logger.debug("CHAT action", {
                    actor: actor.id,
                    message
                })

                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ actor }),
                    content: message
                })
            })()
        )
    }
}
