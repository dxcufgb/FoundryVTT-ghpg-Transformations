import { Transformation } from "../../Transformation.js"
import { ElementalImbalance } from "./Feats/ElementalImbalance.js"
import { RoilingElements } from "./Feats/RoilingElements.js"

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Primordial extends Transformation
{
    static type = "primordial"
    static displayName = "Primordial"
    static itemId = "primordial"
    static uuid = "Compendium.transformations.gh-transformations.Item.y4A8YjHZgKPcZeRc"

    static async onPreUseActivity({
        activity,
        usageConfig,
        dialogConfig,
        messageConfig,
        actor
    } = {})
    {
        RoilingElements.onPreUseActivity({
            activity,
            usageConfig,
            dialogConfig,
            messageConfig,
            actor
        })
    }

    static async onActivityUse(activity, usage)
    {
        if (!shouldSkipPrimordialActivityUseTrigger({activity, usage})) {
            return
        }

        usage.flags ??= {}
        usage.flags.transformations ??= {}
        usage.flags.transformations.skipActivityUseTrigger = true
    }

    static async onRenderChatMessage({
        message,
        html,
        actor,
        activeEffectRepository,
        ChatMessagePartInjector,
        RollService,
        logger
    })
    {
        if (message?.flags?.transformations?.primordialActivity === ElementalImbalance.id) {
            ElementalImbalance.bind({
                actor,
                message,
                html,
                activeEffectRepository,
                ChatMessagePartInjector,
                RollService,
                logger
            })
        }
    }

    static async onPreCalculateDamage({
        actor,
        damage,
        details,
        logger
    } = {})
    {
        if (!ElementalImbalance.actorHasFeat(actor)) return

        await ElementalImbalance.onPreCalculateDamage({
            actor,
            damage,
            details,
            logger
        })
    }
}

function shouldSkipPrimordialActivityUseTrigger({
    activity,
    usage
} = {})
{
    return RoilingElements.isSaveActivity({activity, usage})
}
