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

    // Planar Binding: after a Short or Long Rest, Disadvantage on the first
    // saving throw against a spell originating from an enemy.
    static async onPreRollSavingThrow(context = {}, actor, options = {})
    {
        const key = "fey-plannar-binding-disadvantage"
        const onceService = options?.onceService

        this.logger?.debug?.("Fey.onPreRollSavingThrow", actor, context, options)

        // Basic guard rails
        if (!actor) return
        if (!onceService?.hasOnceBeenExecuted || !onceService?.setOnceFlag) return

        // Concentration saves are not saves against a spell
        if (context?.hookNames?.includes?.("concentration")) return

        // midi-qol passes its workflow on midiOptions; plain configs may carry it directly
        const origin = this.resolveSaveOrigin(context)
        if (origin.item?.type !== "spell") return

        // The spell has to originate from an enemy: not yourself, and not a
        // creature whose token shares your disposition
        const caster = origin.actor
        if (caster?.uuid && caster.uuid === actor.uuid) return
        const casterDisposition = this.getDisposition(origin.token, caster)
        const targetDisposition = this.getDisposition(null, actor)
        if (
            casterDisposition != null &&
            targetDisposition != null &&
            casterDisposition === targetDisposition
        ) return

        if (onceService.hasOnceBeenExecuted(actor, key)) return

        // Advantage and Disadvantage cancel out, so only add Disadvantage.
        // Also set it on each roll: midi-qol rewrites config.disadvantage in its
        // own preRollSavingThrow listener, but keeps the per-roll options.
        context.disadvantage = true
        for (const roll of context.rolls ?? []) {
            roll.options ??= {}
            roll.options.disadvantage = true
        }

        const onceFlags = {
            key,
            reset: ["longRest", "shortRest"]
        }

        await onceService.setOnceFlag(actor, onceFlags)
    }

    // Finds the item, actor and token behind a save roll config
    static resolveSaveOrigin(context = {})
    {
        this.logger?.debug?.("Fey.resolveSaveOrigin", context)

        const midiOptions = context?.midiOptions ?? {}
        let workflow = midiOptions.workflow ?? context?.workflow ?? null

        if (!workflow && midiOptions.workflowId) {
            try {
                workflow = globalThis.MidiQOL?.Workflow?.getWorkflow?.(midiOptions.workflowId) ?? null
            }
            catch {
                workflow = null
            }
        }

        let item = workflow?.item ?? null
        if (!item && midiOptions.saveItemUuid && typeof globalThis.fromUuidSync === "function") {
            try {
                item = globalThis.fromUuidSync(midiOptions.saveItemUuid) ?? null
            }
            catch {
                item = null
            }
        }

        return {
            item,
            actor: workflow?.actor ?? item?.actor ?? null,
            token: workflow?.token ?? null
        }
    }

    static getDisposition(token, actor)
    {
        const disposition =
                  token?.document?.disposition ??
                  token?.disposition ??
                  actor?.getActiveTokens?.()?.[0]?.document?.disposition ??
                  actor?.prototypeToken?.disposition
        return typeof disposition === "number" ? disposition : null
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

        // renderChatMessageHTML passes an HTMLElement; older hooks passed jQuery
        const root = typeof html?.querySelector === "function" ? html : html?.[0]
        const container = root?.querySelector?.(".midi-buttons, .midi-dnd5e-buttons")

        if (!container) return
        if (container.querySelector(".fey-recovery-button")) return

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

        const stage = actor.getFlag("transformations", "stage") ?? 1
        const exhaustion = actorRepository.getExhaustion(actor)
        const hitDiceAvailable = actorRepository.getAvailableHitDice(actor)
        const maxByHitDice = Math.floor(hitDiceAvailable / stage)
        const maxRecoverable = Math.min(exhaustion, maxByHitDice)

        if (maxRecoverable <= 0) {
            ui.notifications.warn("No exhaustion can be recovered.")
            return
        }

        const chosen = await dialogFactory.openFeyExhaustionRecovery({
            stage,
            exhaustion,
            hitDiceAvailable,
            triggeringUserId: game.user?.id ?? null
        })

        const levels = Math.min(Number(chosen) || 0, maxRecoverable)
        if (levels <= 0) return

        const hitDiceCost = levels * stage

        await actorRepository.removeExhaustion(actor, levels)
        await actorRepository.consumeHitDie(actor, hitDiceCost)
    }
}
