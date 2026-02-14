export function createChatService({
    tracker,
    logger
})
{
    async function post({
        speaker,
        content,
        whisper = null,
        flavor = null
    })
    {
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
