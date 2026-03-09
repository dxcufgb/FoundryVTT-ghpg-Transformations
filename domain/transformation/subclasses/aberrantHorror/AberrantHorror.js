import { Transformation } from "../../Transformation.js"

/**
 * Domain subclass.
 * No Foundry.
 * No macros.
 * No UI.
 * No logging.
 */
export class AberrantHorror extends Transformation
{

    static type = "aberrantHorror";
    static displayName = "Aberrant Horror"
    static itemId = "aberrant-horror";
    static uuid = "Compendium.transformations.gh-transformations.Item.LYRqg32rV17vq7L2";

    static onPreRollHitDie(context, actor)
    {
        const hasLoss = actor.effects.some(e =>
            e.name === "Aberrant Loss Of Vitality"
        )

        if (!hasLoss) return

        for (const roll of context.rolls ?? []) {
            roll.parts = roll.parts.map(part =>
            {
                if (typeof part !== "string") return part
                return part.replace("+ @abilities.con.mod", "").trim()
            })
        }
    }

    static async onPreRollSavingThrow(actor, context, options = {})
    {
        this.logger?.debug?.("AberrantHorror.onPreRollSavingThrow", actor, context, options)
        if (context.workflow?.item?.type !== "spell") return
        context.subject.setFlag("transformations", "saveIsSpell", true)
    }

}