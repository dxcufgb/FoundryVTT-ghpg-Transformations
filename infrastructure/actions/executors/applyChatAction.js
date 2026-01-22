import { interpolateMessage } from "../utils/interpolateMessage.js";
import { buildExpressionContext } from "../utils/expressionContext.js";

/**
 * Apply a chat message action.
 */
export async function applyChatAction({ actor, data, context, logger }) {
    const {
        message,
        variables,
        template,
        speaker = "actor",
        flavor,
        whisper,
        blockIfNoMessage = false
    } = data ?? {};

    let content = "";

    let exprContext = buildExpressionContext(actor, context)

    if (message) {
        content = interpolateMessage(message, exprContext);
    }

    if (template) {
        content = await renderTemplate(template, {
            actor,
            context: exprContext
        });
    }

    if (!content) {
        return {
            applied: false,
            block: blockIfNoMessage,
            reason: "no-chat-content"
        };
    }

    const chatSpeaker =
        speaker === "actor"
            ? ChatMessage.getSpeaker({ actor })
            : speaker === "gm"
                ? { alias: "GM" }
                : { alias: "System" };

    let whisperIds;
    if (whisper === "gm") {
        whisperIds = ChatMessage.getWhisperRecipients("GM");
    } else if (whisper === "self") {
        whisperIds = [game.user.id];
    }

    await ChatMessage.create({
        speaker: chatSpeaker,
        content,
        flavor,
        whisper: whisperIds
    });

    return { applied: true };
}
