import { Transformation } from "../../Transformation.js"
import { renderDevilishContractor } from "./activities/DevilishContractor.js"
import { giftsOfDamnation } from "./giftsOfDamnation/index.js";
import { ChatCardActionBinder } from "../../../../ui/chatCards/ChatCardActionBinder.js";

/**
 * Domain subclass.
 * No Foundry.
 * No macros.
 * No UI.
 * No logging.
 */
export class Fiend extends Transformation {
    static type = "fiend";
    static displayName = "Fiend"
    static itemId = "fiend";
    static uuid = "Compendium.transformations.gh-transformations.Item.zpVEJPFBfdqC5sQH";
    static giftsOfDamnations = giftsOfDamnation

    static async getInfernalSmiteDamageType(workflow, rolls) {
        const item = workflow.item
        const actor = workflow.actor
        const activity = workflow.activity
        if (!actor) return

        if (!item || item.name !== "Infernal Smite") return

        const fiendishSoul = actor.items.find(i => i.name === "Fiendish Soul")
        if (!fiendishSoul) return
        const resistanceEffect =
                  actor.effects.find(e =>
                      e.origin === fiendishSoul.uuid &&
                      e.flags?.transformations?.advancementChoiceType === "damageResistance"
                  ) ??
                  actor.effects.find(e =>
                      e.flags?.transformations?.advancementChoiceType === "damageResistance"
                  )

        const resistanceChange = resistanceEffect?.changes?.find(c =>
            c.key === "system.traits.dr.value"
        )

        const damageType = resistanceChange?.value
        if (!damageType) return

        for (const roll of rolls) {
            roll.options.types.push(damageType)
        }

        for (const part of activity.damage.parts) {
            part.types.add(damageType)
        }
    }

    static async onRenderChatMessage({
        message,
        html,
        actor,
        actorRepository,
        dialogFactory,
        ChatMessagePartInjector,
        RollService,
        logger
    })
    {

        const activityData = message?.flags?.dnd5e?.activity
        if (!activityData) return

        const activity = await fromUuid(activityData.uuid)
        if (!activity) return
        
        if (!actor.isOwner) return

        if (activity.flags?.transformations?.gift) {

            ChatCardActionBinder.bind({
                message,
                html,
                giftsOfDamnation: this.giftsOfDamnations,
                actorRepository,
                ChatMessagePartInjector,
                RollService,
                logger
            })
        } else {

            const container = html?.querySelector(".midi-buttons")
            if (!container) return

            switch (activity?.name) {
                case "Devilish Contractor":
                    await renderDevilishContractor({
                        actor,
                        dialogFactory,
                        container,
                        logger
                    })
                    break
            }
        }
    }

    static async onActivityUse(activity, usage, message, actorRepository, ChatMessagePartInjector) {
        if (!activity.flags?.transformations?.gift) return

        const giftEntry = this.giftsOfDamnations
        .find(g => g.id === activity.flags.transformations.gift)

        if (!giftEntry) return

        const GiftClass = giftEntry.GiftClass

        if (!GiftClass?.giftActivity) return

        await GiftClass.giftActivity({
            actor: usage.workflow.actor,
            message,
            actorRepository,
            ChatMessagePartInjector
        })
    }
}
