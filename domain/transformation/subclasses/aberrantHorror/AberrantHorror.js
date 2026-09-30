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

    static async onPreRollSavingThrow(context, actor, options = {})
    {
        this.logger?.debug?.("AberrantHorror.onPreRollSavingThrow", actor, context, options)
        const subject = context?.subject ?? actor
        if (typeof subject?.setFlag !== "function") return

        // The flag describes the save that is about to be rolled, so it is
        // rewritten on every save; otherwise one spell save would make every
        // later save count as a save against a spell (Unstable Existence).
        const isSpell = isSaveAgainstSpell(context)
        const current = subject.getFlag?.("transformations", "saveIsSpell") === true

        if (current === isSpell) return

        await subject.setFlag("transformations", "saveIsSpell", isSpell)
    }

}

function isSaveAgainstSpell(context)
{
    const workflowItem = context?.workflow?.item ?? context?.midiOptions?.workflow?.item
    if (workflowItem) return workflowItem.type === "spell"

    // midi-qol passes the originating item's uuid when it requests the save.
    const saveItemUuid = context?.midiOptions?.saveItemUuid
    if (!saveItemUuid || typeof globalThis.fromUuidSync !== "function") return false

    try {
        return globalThis.fromUuidSync(saveItemUuid)?.type === "spell"
    }
    catch {
        return false
    }
}
