import { Transformation } from "../../Transformation.js"
import { createHagsEye } from "./Activities/CreateHagsEye.js"
import { GrantWaterBreathing } from "./Activities/GrantWaterBreathing.js"
import { hagSpellRecovery } from "./Activities/HagSpellRecovery.js"
import { MasterOfRedClawHealing } from "./Activities/MasterOfRedClawHealing.js"
import { activityMatchesName } from "../../../../utils/activityNames.js"

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

        // midi-qol puts the workflow on context.midiOptions.workflow.
        const workflow = context?.midiOptions?.workflow ?? context?.workflow
        const sourceUuid = workflow?.item?.flags?.transformations?.sourceUuid

        if (sourceUuid && itemsWithCustomSavingThrowTriggers.includes(sourceUuid)) {
            await context.subject?.setFlag?.(
                "transformations",
                "saveItemUuid",
                sourceUuid
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
        dialogFactory,
        triggeringUserId = null
    )
    {
        this.logger?.debug?.("Hag.onActivityUse", activity, usage, message)
        if (MasterOfRedClawHealing.onActivityUse({
            activity,
            usage,
            actor: usage?.workflow?.actor ?? activity?.actor ?? null,
            logger: this.logger
        }))
        {
            return
        }

        // "Midi Use" is called "Use" when midi-qol's activity name prefix is off
        const activityName = activityMatchesName(activity, "Midi Use")
            ? "Midi Use"
            : activity.name
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
                    dialogFactory,
                    triggeringUserId
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
