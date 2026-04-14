import { Transformation } from "../../Transformation.js"
import {
    LegionOfSlimeMerge,
    LegionOfSlimeSplit
} from "./activities/LegionOfSlimeSplit.js"

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Ooze extends Transformation
{
    static type = "ooze"
    static displayName = "Ooze"
    static itemId = "ooze"
    static uuid = "Compendium.transformations.gh-transformations.Item.Y4tNZVNBUiPARNHd"

    static async onRenderChatMessage({
        message,
        html,
        actor,
        ChatMessagePartInjector,
        logger
    })
    {
        if (!actor?.isOwner) return

        switch (message?.flags?.transformations?.oozeActivity) {
            case LegionOfSlimeSplit.id:
                LegionOfSlimeSplit.bind({
                    actor,
                    message,
                    html,
                    ChatMessagePartInjector,
                    logger
                })
                break
        }
    }

    static async onActivityUse(
        activity,
        usage,
        message,
        actorRepository,
        ChatMessagePartInjector
    )
    {
        const itemSourceUuid =
                  usage?.workflow?.item?.flags?.transformations?.sourceUuid ??
                  activity?.parent?.parent?.flags?.transformations?.sourceUuid ??
                  activity?.parent?.flags?.transformations?.sourceUuid ??
                  null
        const itemName =
                  activity?.parent?.parent?.name ??
                  activity?.parent?.name ??
                  usage?.workflow?.item?.name ??
                  ""
        const activityName = activity?.name?.toLowerCase?.() ?? ""
        const actor = usage?.workflow?.actor ?? null
        const token =
                  usage?.workflow?.token?.document ??
                  usage?.workflow?.token ??
                  actor?.token?.document ??
                  actor?.token ??
                  null

        switch (activityName) {
            case "split":
                if (
                    itemSourceUuid !== LegionOfSlimeSplit.itemSourceUuid &&
                    itemName !== "Legion of Slime"
                ) {
                    return
                }

                await LegionOfSlimeSplit.activityUse({
                    actor,
                    token,
                    item: usage?.workflow?.item ?? activity?.parent?.parent ?? activity?.parent ?? null,
                    message,
                    ChatMessagePartInjector
                })
                break
            case "merge":
                if (
                    itemSourceUuid !== LegionOfSlimeMerge.itemSourceUuid &&
                    itemName !== "Legion of Slime"
                ) {
                    return
                }

                await LegionOfSlimeMerge.activityUse({
                    actor,
                    token,
                    message
                })
                break
        }
    }
}
