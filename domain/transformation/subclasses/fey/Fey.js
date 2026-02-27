import { Transformation } from "../../Transformation.js"

/**
 * Domain subclass.
 * No Foundry.
 * No macros.
 * No UI.
 * No logging.
 */
export class Fey extends Transformation
{

    static type = "fey";
    static displayName = "Fey"
    static itemId = "fey";
    static uuid = "Compendium.transformations.gh-transformations.Item.6jKzfDJyRwAkuyZv";

    static async onPreRollSavingThrow(actor, context, options = {})
    {
        const key = "fey-plannar-binding-disadvantage"
        const onceService = options.onceService
        this.logger?.debug?.("Fey.onPreRollSavingThrow", actor, context, options)
        if (context.workflow.item.type != "spell") return
        if (onceService.hasOnceBeenExecuted(actor, key)) return
        if (context.advantage === true) {
            context.advantage = false
        } else {
            context.disadvantage = true
        }
        const onceFlags = {
            key,
            reset: ["longRest", "shortRest"]
        }
        await onceService.setOnceFlag(actor, onceFlags)
    }
}