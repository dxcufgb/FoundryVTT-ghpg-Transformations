export function createChatService({ logger }) {

    async function post({
        speaker,
        content,
        whisper = null,
        flavor = null
    }) {
        if (!content) return;

        return ChatMessage.create({
            speaker,
            content,
            flavor,
            whisper
        });
    }

    return Object.freeze({ post });
}