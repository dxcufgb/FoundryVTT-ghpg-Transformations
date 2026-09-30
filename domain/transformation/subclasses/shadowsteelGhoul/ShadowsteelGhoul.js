import { Transformation } from "../../Transformation.js"
import { ShadowsteelCurseRoll } from "./activities/ShadowsteelCurseRoll.js"
import { ShadowsteelFury } from "./activities/ShadowsteelFury.js"

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class ShadowsteelGhoul extends Transformation
{
    static type = "shadowsteelGhoul"
    static displayName = "Shadowsteel Ghoul"
    static itemId = "shadowsteelGhoul"
    static uuid = "Compendium.transformations.gh-transformations.Item.YPXUBEqZSzM2pkSr"

    static async onRenderChatMessage({
        message,
        html,
        actor,
        logger
    } = {})
    {
        await ShadowsteelCurseRoll.onRenderChatMessage({
            message,
            html,
            actor,
            logger
        })
    }

    static onPreUseActivity({
        activity,
        actor,
        logger
    } = {})
    {
        logger?.debug?.("ShadowsteelGhoul.onPreUseActivity", {activity, actor})
        // Synchronous on purpose: dnd5e/Midi read the save DC after this hook returns.
        ShadowsteelFury.onPreUseActivity({
            activity,
            actor,
            logger
        })
    }
}
