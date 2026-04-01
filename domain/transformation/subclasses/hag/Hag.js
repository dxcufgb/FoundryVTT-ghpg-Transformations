import { Transformation } from "../../Transformation.js"
import { createHagsEye } from "./Activities/CreateHagsEye.js"
import { GrantWaterBreathing } from "./Activities/GrantWaterBreathing.js"
import { hagSpellRecovery } from "./Activities/HagSpellRecovery.js"

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
        const itemsWithCustomSavingThrowTriggers = [
            "Compendium.transformations.gh-transformations.Item.EIdDZiQTXHP8J1hU",
            "Compendium.transformations.gh-transformations.Item.6xN7rWi01hoqVLtv"
        ]

        if (itemsWithCustomSavingThrowTriggers.find(i => i === context.workflow?.item?.flags.transformations.sourceUuid)) {
            context.subject.setFlag(
                "transformations",
                "saveItemUuid",
                context.workflow?.item?.flags.transformations.sourceUuid
            )
        }
    }

    static async onRenderChatMessage({
        message,
        html,
        actor,
        actorRepository,
        ChatMessagePartInjector,
        RollService,
        logger
    })
    {
        if (!actor?.isOwner) return

        if (message?.flags?.transformations?.hagActivity === GrantWaterBreathing.id) {
            GrantWaterBreathing.bind({
                actor,
                message,
                html,
                actorRepository,
                ChatMessagePartInjector,
                RollService,
                logger
            })
        }
    }

    static async onActivityUse(
        activity,
        usage,
        message,
        actorRepository,
        ChatMessagePartInjector,
        itemRepository,
        dialogFactory
    )
    {
        const activityName = activity.name
        const itemName = activity?.parent?.parent?.name ?? activity?.parent?.name ?? usage?.workflow?.item?.name
        switch (activityName) {
            case "Midi Use":
                switch (itemName) {
                    case "Create Hag's Eye":
                        await createHagsEye({
                            actor: usage?.workflow?.actor,
                            itemRepository
                        })
                        break
                }
                break
            case "Hag Spell Recovery":
                await hagSpellRecovery({
                    actor: usage?.workflow?.actor,
                    actorRepository,
                    dialogFactory
                })
                break
            case "Grant Water Breathing":
                await GrantWaterBreathing.activityUse({
                    actor: usage?.workflow?.actor,
                    message,
                    actorRepository,
                    ChatMessagePartInjector
                })
                break
        }
    }
}
