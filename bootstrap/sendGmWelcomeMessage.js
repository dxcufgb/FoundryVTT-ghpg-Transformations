import {
    buildGmWelcomeCardContent,
    GM_WELCOME_CARD_FLAG
} from "../ui/chatCards/GmWelcomeCard.js"

export async function sendGmWelcomeMessage({
    game,
    logger
})
{
    logger.debug("sendGmWelcomeMessage", {game})

    return ChatMessage.create({
        content: buildGmWelcomeCardContent(),
        speaker: ChatMessage.getSpeaker({alias: "Transformations"}),
        whisper: [game.user.id],
        flags: {transformations: {[GM_WELCOME_CARD_FLAG]: true}}
    })
}
