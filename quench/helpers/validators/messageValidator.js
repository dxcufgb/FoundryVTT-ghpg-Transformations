export function messageValidator({
    assert,
    messageType = "NA",
    logger = null })
{
    let failed = false
    let error = null

    const api = {

        validateNumberOfMessages(numberOfMessages)
        {
            safe(() =>
            {
                const messages = getMessagesByType(messageType)
                assert.equal(
                    messages.length, numberOfMessages,
                    `Number of effects was not correct! actual: ${messages.length}, expected: ${numberOfMessages}`
                )
            })
            return api
        },

        validateMessageFlavours(messageFlavours, mode = "includes")
        {
            safe(() =>
            {
                const messages = getMessagesByType(messageType)
                if (messageFlavours instanceof Array && messageFlavours.size > 0) {
                    for (let messageIndex = 0; messageIndex < messageFlavours; messageIndex++) {
                        switch (mode) {
                            case "includes":
                                assert.ok(
                                    messages[messageIndex].flavor.includes(messageFlavours[messageIndex]),
                                    `Expected flavor to contain "${messageFlavours[messageIndex]}"`
                                )
                            default:
                                console.error(`Unknown mode: ${mode}`)
                        }
                    }
                }
            })
            return api
        },

        validateMessageContents(messageContents, mode = "equal")
        {
            safe(() =>
            {
                const messages = getMessagesByType(messageType)
                if (messageContents instanceof Array && messageContents.size > 0) {
                    for (let messageIndex = 0; messageIndex < messageContents; messageIndex++) {
                        switch (mode) {
                            case "includes":
                                assert.ok(
                                    messages[messageIndex].flavor.includes(messageContents[messageIndex]),
                                    `Expected flavor to contain "${messageContents[messageIndex]}"`
                                )
                            case "equal":
                                assert.equal(
                                    messages[messageIndex],
                                    messageContents[messageIndex],
                                    `MessageContent was not equal! expected: ${messageContents[messageIndex]}, actual: ${messages[messageIndex]}`
                                )
                            default:
                                console.error(`Unknown mode: ${mode}`)
                        }
                    }
                }
            })
            return api
        },


        // 🔥 This allows assert.isTrue(...) compatibility
        validate()
        {
            if (failed) throw error
            return true
        }
    }

    function safe(fn)
    {
        // try {
        fn()
        // } catch (e) {
        //     failed = true
        //     error = e
        // }
    }

    function getMessagesByType(type)
    {
        switch (type) {
            case "RollTable":
                return game.messages.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )
            case "NA":
                return game.messages.contents
            default:
                console.error(`messageValidator, Unknown messageType: "${type}"`)
        }
    }
    return api
}
