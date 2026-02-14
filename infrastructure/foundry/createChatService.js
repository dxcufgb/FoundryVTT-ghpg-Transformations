export function createChatService({
    tracker,
    logger
})
{
    logger.debug("createChatService", { tracker })

    async function post({
        speaker,
        content,
        whisper = null,
        flavor = null
    })
    {
        logger.debug("createChatService.post", {
            speaker,
            content,
            whisper,
            flavor
        })
        if (!content) return

        return tracker.track(
            (async () =>
            {
                return ChatMessage.create({
                    speaker,
                    content,
                    flavor,
                    whisper
                })
            })()
        )
    }

    return Object.freeze({
        whenIdle: tracker.whenIdle,
        post
    })

}
