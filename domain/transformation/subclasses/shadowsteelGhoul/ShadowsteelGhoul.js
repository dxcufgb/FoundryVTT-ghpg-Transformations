import { Transformation } from "../../Transformation.js"
import { ShadowsteelCurseRoll } from "./activities/ShadowsteelCurseRoll.js"

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
}
