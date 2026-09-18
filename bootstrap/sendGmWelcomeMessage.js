const WELCOME_MESSAGE_CONTENT = `
<h3>Welcome to Transformations!</h3>
<p>Greetings, GM! For the best experience the following settings should be considered and applied:</p>
<ol>
    <li>
        In Settings &rarr; MidiQOL &rarr; Workflow, set the setting
        "Auto apply item effects" to "apply effects and don't show button".
    </li>
    <br>
    <li>
        If you want players to be able to place summons themselves, they need
        the user permissions to create both actors and tokens. The dnd5e
        setting "Allow summoning" also needs to be active.
    </li>
</ol>
<p>Thank you for installing the Transformations module!</p>
`

export async function sendGmWelcomeMessage({
    game,
    logger
})
{
    logger.debug("sendGmWelcomeMessage", {game})

    return ChatMessage.create({
        content: WELCOME_MESSAGE_CONTENT,
        speaker: ChatMessage.getSpeaker({alias: "Transformations"}),
        whisper: [game.user.id]
    })
}
