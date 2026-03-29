import { Transformation } from "../../Transformation.js"

/**
 * Domain subclass.
 * No Foundry.
 * No macros.
 * No UI.
 * No logging.
 */
export class Hag extends Transformation
{

    static type = "hag";
    static displayName = "Hag"
    static itemId = "hag";
    static uuid = "Compendium.transformations.gh-transformations.Item.w7xSPApiq5Upvom8";

    static onPreRollHitDie(context, actor)
    {
        this.logger?.debug?.("Hag.onPreRollHitDie", context, actor)
    }

    static async onPreRollSavingThrow(context, actor, options = {})
    {
        this.logger?.debug?.("Hag.onPreRollSavingThrow", actor, context, options)
        if (context.workflow?.item?.flags.transformations.sourceUuid !== "Compendium.transformations.gh-transformations.Item.EIdDZiQTXHP8J1hU") return
        context.subject.setFlag(
            "transformations",
            "saveItemUuid",
            "Compendium.transformations.gh-transformations.Item.EIdDZiQTXHP8J1hU"
        )
    }

}