export const MASTER_OF_RED_CLAW_UUID =
                 "Compendium.transformations.gh-transformations.Item.0QxkaaXnKKlzdAha"

const HEALING_DAMAGE_TYPE = "psychic"
// midi-qol workflows can wait on manual attack/damage rolls, so allow plenty of time
const WORKFLOW_COMPLETE_TIMEOUT_MS = 15 * 60 * 1000

/**
 * Master of the Red Sisterhood: the Claw's extra Psychic damage heals the hag
 * for the Psychic damage it deals. The damage is only known once midi-qol has
 * finished the workflow, so the healing waits for midi-qol.RollComplete.
 */
export class MasterOfRedClawHealing
{
    static onActivityUse({
        activity,
        usage,
        actor,
        logger = null
    } = {})
    {
        logger?.debug?.("MasterOfRedClawHealing.onActivityUse", {activity, usage, actor})
        if (!actor || !this.isMasterOfRedClawUse({activity, usage})) return false

        const workflow = usage?.workflow ?? null
        if (!workflow) return false

        this.whenWorkflowComplete(workflow, () =>
            this.healFromWorkflow({workflow, actor, logger}).catch(error =>
                logger?.warn?.("Master of the Red Sisterhood claw healing failed", error)
            )
        )

        return true
    }

    static isMasterOfRedClawUse({activity, usage} = {})
    {
        const item =
                  usage?.workflow?.item ??
                  activity?.item ??
                  activity?.parent?.parent ??
                  null
        if (!item) return false

        return [
            item?.flags?.transformations?.sourceUuid,
            item?._stats?.compendiumSource,
            item?.flags?.core?.sourceId
        ].includes(MASTER_OF_RED_CLAW_UUID)
    }

    static whenWorkflowComplete(workflow, callback)
    {
        const hooks = globalThis.Hooks
        if (!hooks?.on) return

        let done = false
        let timeoutId = null
        const hookId = hooks.on("midi-qol.RollComplete", completed =>
        {
            if (done) return
            if (completed !== workflow && (!completed?.id || completed.id !== workflow.id)) return

            done = true
            hooks.off("midi-qol.RollComplete", hookId)
            if (timeoutId) clearTimeout(timeoutId)
            callback()
        })

        timeoutId = setTimeout(() =>
        {
            if (done) return
            done = true
            hooks.off("midi-qol.RollComplete", hookId)
        }, WORKFLOW_COMPLETE_TIMEOUT_MS)
    }

    /**
     * Psychic damage dealt to every damaged target, after resistances etc.
     */
    static getPsychicDamageDealt(workflow)
    {
        let total = 0

        for (const entry of workflow?.damageList ?? []) {
            for (const detail of entry?.damageDetail ?? []) {
                if (detail?.type !== HEALING_DAMAGE_TYPE) continue

                const value = Number(detail?.value)
                if (Number.isFinite(value) && value > 0) total += value
            }
        }

        return Math.floor(total)
    }

    static async healFromWorkflow({workflow, actor, logger = null} = {})
    {
        logger?.debug?.("MasterOfRedClawHealing.healFromWorkflow", {workflow, actor})
        const healing = this.getPsychicDamageDealt(workflow)
        if (healing <= 0 || !actor?.isOwner) return 0

        await actor.applyDamage([{value: healing, type: "healing"}])
        return healing
    }
}
