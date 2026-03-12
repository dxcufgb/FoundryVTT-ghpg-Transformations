import { Transformation } from "../../Transformation.js"

/**
 * Domain subclass.
 * No Foundry.
 * No macros.
 * No UI.
 * No logging.
 */
export class Fiend extends Transformation
{

    static type = "fiend";
    static displayName = "Fiend"
    static itemId = "fiend";
    static uuid = "Compendium.transformations.gh-transformations.Item.zpVEJPFBfdqC5sQH";

    static async onRenderChatMessage({
        message,
        html,
        actor,
        dialogFactory,
        logger
    })
    {
        logger?.debug?.("Fiend.onRenderChatMEssage", { message, actor })

        const activityData = message?.flags?.dnd5e?.activity
        if (!activityData) return

        const activity = await fromUuid(activityData.uuid)

        if (activity?.name !== "Devilish Contractor") return

        if (!actor.isOwner) return

        const container = html?.[0]?.querySelector(".midi-buttons")
        if (!container) return

        const button = document.createElement("button")
        button.type = "button"
        button.textContent = "Choose gift of damnation"
        button.classList.add("fiend-devilish-contractor-button")

        button.addEventListener("click", async () =>
        {
            await this.handleDevilishContractorClick({
                actor,
                dialogFactory,
                logger
            })
        })

        container.prepend(button)
    }

    static async handleDevilishContractorClick({
        actor,
        dialogFactory,
        logger
    })
    {
        logger?.debug?.("Fiend.handleDevilishContractorClick", { actor })

        const stage = actor.getFlag("transformations", "stage") ?? 0

        if (stage > 0) {
            const applied = await dialogFactory.openFiendGiftOfDamnation({
                actor,
                stage
            })
        }
        if (!applied) return
    }

    static async getInfernalSmiteDamageType(workflow, rolls)
    {
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
}
