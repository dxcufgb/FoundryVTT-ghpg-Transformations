import { Transformation } from "../../Transformation.js"
import { BlindingRadiance } from "./Feats/BlindingRadiance.js"

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Seraph extends Transformation
{
    static type = "seraph"
    static displayName = "Seraph"
    static itemId = "seraph"
    static uuid = "Compendium.transformations.gh-transformations.Item.0RQPtoc3ezLChL8o"

    static async onPreUseActivity({
        activity,
        usageConfig,
        dialogConfig,
        messageConfig,
        actor
    } = {})
    {
        BlindingRadiance.onPreUseActivity({
            activity,
            usageConfig,
            dialogConfig,
            messageConfig,
            actor
        })
    }

    static async onActivityUse(
        activity,
        usage
    )
    {
        if (!shouldSkipSeraphActivityUseTrigger({activity, usage})) {
            return {
                skipActivityUseTrigger: false
            }
        }

        usage.flags ??= {}
        usage.flags.transformations ??= {}
        usage.flags.transformations.skipActivityUseTrigger = true

        return {
            skipActivityUseTrigger: true
        }
    }

    static async onRenderChatMessage({
        message,
        html,
        actor,
        ChatMessagePartInjector
    } = {})
    {
        await BlindingRadiance.onRenderChatMessage({
            message,
            html,
            actor,
            ChatMessagePartInjector
        })
    }
}

function shouldSkipSeraphActivityUseTrigger({
    activity,
    usage
} = {})
{
    return BlindingRadiance.isSaveActivity({activity, usage})
}
