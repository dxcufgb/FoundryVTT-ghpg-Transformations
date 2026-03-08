export function interceptChatCreate({ debounceMs = 0 } = {})
{
    const originalCreate = ChatMessage.create

    let chatCallCount = 0
    let lastCall = 0

    ChatMessage.create = async function(...args)
    {
        const now = Date.now()

        if (!debounceMs || now - lastCall > debounceMs) {
            chatCallCount++
            lastCall = now
        }

        return originalCreate.apply(this, args)
    }

    return {
        getCount: () => chatCallCount,
        restore: () =>
        {
            ChatMessage.create = originalCreate
        }
    }
}