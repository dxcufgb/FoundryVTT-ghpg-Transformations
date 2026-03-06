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

    static async onPreRollSavingThrow(actor, context = {}, options = {})
    {
        const key = "fey-plannar-binding-disadvantage"
        const onceService = options?.onceService

        this.logger?.debug?.("Fey.onPreRollSavingThrow", actor, context, options)

        // Basic guard rails
        if (!actor) return
        if (!onceService?.hasOnceBeenExecuted || !onceService?.setOnceFlag) return

        const itemType = context?.workflow?.item?.type
        if (itemType !== "spell") return

        if (onceService.hasOnceBeenExecuted(actor, key)) return

        // Safely mutate context flags
        if (context?.advantage === true) {
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

    static async onRenderChatMessage({
        message,
        html,
        actor,
        actorRepository,
        dialogFactory,
        logger
    })
    {
        logger?.debug?.("Fey.onRenderChatMessage", { message, actor })

        const activityData = message?.flags?.dnd5e?.activity
        if (!activityData) return

        const activity = await fromUuid(activityData.uuid)

        if (activity?.name !== "Fey Exhaustion Recovery") return

        if (!actor.isOwner) return

        const container = html?.[0]?.querySelector(".midi-buttons")

        if (!container) return

        const button = document.createElement("button")
        button.type = "button"
        button.textContent = "Recover exhaustion levels"
        button.classList.add("fey-recovery-button")

        button.addEventListener("click", async () =>
        {
            await this.handleFeyRecoveryClick({
                actor,
                actorRepository,
                dialogFactory,
                logger
            })
        })

        container.prepend(button)
    }

    static async handleFeyRecoveryClick({
        actor,
        actorRepository,
        dialogFactory,
        logger
    })
    {
        logger?.debug?.("Fey.handleFeyRecoveryClick", { actor })

        const stage =
            actor.getFlag("transformations", "stage") ?? 1

        const exhaustion =
            actorRepository.getExhaustion(actor)

        const hitDiceAvailable =
            actorRepository.getAvailableHitDice(actor)

        const maxByHitDice =
            Math.floor(hitDiceAvailable / stage)

        const maxRecoverable =
            Math.min(exhaustion, maxByHitDice)

        if (maxRecoverable <= 0) {
            ui.notifications.warn("No exhaustion can be recovered.")
            return
        }

        const chosen =
            await dialogFactory.openFeyExhaustionRecovery({
                stage,
                exhaustion,
                hitDiceAvailable
            })

        if (!chosen) return

        const hitDiceCost = chosen * stage

        await actorRepository.removeExhaustion(actor, chosen)
        await actorRepository.consumeHitDie(actor, hitDiceCost)
    }
}