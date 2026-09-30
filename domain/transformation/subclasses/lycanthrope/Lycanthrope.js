import { Transformation } from "../../Transformation.js"
import {
    LYCANTHROPE_HUNTERS_FOCUS_DAMAGE_FORMULA,
    LYCANTHROPE_HUNTERS_MARK_FLAG_KEY
} from "./constants.js"
import { isInHybridForm } from "./macros/handlers.js"

function toArray(collection)
{
    if (!collection) return []
    if (Array.isArray(collection)) return collection
    if (Array.isArray(collection?.contents)) return collection.contents
    if (typeof collection?.[Symbol.iterator] === "function") return Array.from(collection)
    if (typeof collection === "object") return Object.values(collection)
    return []
}

function resolveTokenActor(target)
{
    return target?.actor ?? target?.document?.actor ?? null
}

/**
 * Uuids the attacker may have had when it applied the mark. A linked actor that transforms
 * (dnd5e transformInto) becomes a new world actor, so the mark placed before a re-transform
 * points at the original or a previous actor id.
 */
function getAttackerUuids(actor)
{
    const uuids = new Set()
    if (actor?.uuid) uuids.add(actor.uuid)
    if (actor?.isToken) return [...uuids]

    const dnd5eFlags = actor?.flags?.dnd5e ?? {}
    const previousIds = Array.isArray(dnd5eFlags.previousActorIds) ? dnd5eFlags.previousActorIds : []
    for (const id of [dnd5eFlags.originalActor, ...previousIds]) {
        if (typeof id === "string" && id) uuids.add(`Actor.${id}`)
    }

    return [...uuids]
}

function isOriginFromActor(origin, actor)
{
    if (typeof origin !== "string" || !origin) return false

    return getAttackerUuids(actor).some(uuid =>
        origin === uuid || origin.startsWith(`${uuid}.`)
    )
}

/**
 * True when the target carries a Hunter's Mark effect that was applied by the attacker.
 */
export function isMarkedBy(target, attacker)
{
    const targetActor = resolveTokenActor(target)
    if (!targetActor || !attacker) return false

    return toArray(targetActor.effects).some(effect =>
        !effect?.disabled &&
        toArray(effect?.changes).some(change =>
            change?.key === LYCANTHROPE_HUNTERS_MARK_FLAG_KEY
        ) &&
        isOriginFromActor(effect?.origin, attacker)
    )
}

function isMeleeAttack(activity)
{
    if (!activity) return false
    if (activity.attack?.type?.value === "melee") return true

    return ["mwak", "msak"].includes(activity.actionType)
}

function resolveHitTargets(workflow)
{
    if (workflow?.hitTargets) return toArray(workflow.hitTargets)
    if (workflow?.targets) return toArray(workflow.targets)

    return toArray(globalThis.game?.user?.targets)
}

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Lycanthrope extends Transformation
{
    static type = "lycanthrope"
    static displayName = "Lycanthrope"
    static itemId = "lycanthrope"
    static uuid = "Compendium.transformations.gh-transformations.Item.u7PEMryfWOkT6aja"

    /**
     * Hunter's Focus: while in hybrid form, melee hits against the creature this actor
     * marked deal an extra 1d6 damage of the attack's type. Runs synchronously so the
     * pending damage config is updated before dnd5e builds the rolls.
     */
    static onPreRollDamage({ actor, activity, rolls = [], workflow = null, logger = null } = {})
    {
        logger?.debug?.("Lycanthrope.onPreRollDamage", { actor, activity, rolls, workflow })
        if (!actor || !rolls?.length) return
        if (!isInHybridForm(actor)) return
        if (!isMeleeAttack(activity)) return

        const targets = resolveHitTargets(workflow)
        if (!targets.some(target => isMarkedBy(target, actor))) return

        const roll = rolls[0]
        if (!roll || typeof roll !== "object") return

        roll.parts = [
            ...toArray(roll.parts),
            LYCANTHROPE_HUNTERS_FOCUS_DAMAGE_FORMULA
        ]
    }
}
