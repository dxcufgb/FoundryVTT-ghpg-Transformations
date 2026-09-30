export const DAEMONIC_BRAND_ATTACK_VULNERABILITY_EFFECT_NAME = "Daemonic Brand Attack Vulnerability"
export const DAEMONIC_BRAND_ATTACKED_ACTION = "daemonicBrandAttacked"

const FLAG_SCOPE = "transformations"
const ATTACKED_TURN_FLAG_KEY = "daemonicBrand.attackedTurn"

/**
 * midi-qol condition on the "Daemonic Brand Attack Vulnerability" effect
 * (flags.midi-qol.grants.advantage.attack.all). midi-qol evaluates it on the
 * branded creature for every attack against it: Advantage unless an attack
 * against it was already recorded for the current combat turn. Outside combat
 * every attack counts as the first one. Keep in sync with getTurnKey().
 */
export const DAEMONIC_BRAND_ATTACK_VULNERABILITY_CONDITION =
    "!combat || !combat.started || " +
    "workflow?.targets?.first()?.actor?.flags?.transformations?.daemonicBrand?.attackedTurn !== " +
    "(combat.id + '.' + combat.round + '.' + combat.turn)"

/**
 * Daemonic Brand, option (b): the first attack against the branded creature
 * on each turn is made with Advantage.
 *
 * Advantage itself is granted by midi-qol through the effect's grants flag;
 * this class tracks which turn the branded creature was last attacked in.
 */
export class DaemonicBrand
{
    static getTurnKey(combat = globalThis.game?.combat ?? null)
    {
        if (!combat?.started) return null
        return `${combat.id}.${combat.round}.${combat.turn}`
    }

    static hasAttackVulnerability(actor)
    {
        const effects = actor?.appliedEffects ?? actor?.effects ?? []
        return [...effects].some(effect =>
            effect?.name === DAEMONIC_BRAND_ATTACK_VULNERABILITY_EFFECT_NAME &&
            effect?.disabled !== true
        )
    }

    static getAttackedTurn(actor)
    {
        return actor?.flags?.transformations?.daemonicBrand?.attackedTurn ?? null
    }

    static isFirstAttackThisTurn(actor, combat = globalThis.game?.combat ?? null)
    {
        const turnKey = this.getTurnKey(combat)
        if (!turnKey) return true
        return this.getAttackedTurn(actor) !== turnKey
    }

    static grantsAttackAdvantage(actor, combat = globalThis.game?.combat ?? null)
    {
        return this.hasAttackVulnerability(actor) &&
            this.isFirstAttackThisTurn(actor, combat)
    }

    /**
     * Stores the current combat turn on the branded creature (GM side).
     */
    static async markAttacked(actor, combat = globalThis.game?.combat ?? null)
    {
        const turnKey = this.getTurnKey(combat)
        if (!actor || !turnKey) return false
        if (this.getAttackedTurn(actor) === turnKey) return false

        await actor.setFlag(FLAG_SCOPE, ATTACKED_TURN_FLAG_KEY, turnKey)
        return true
    }

    /**
     * Records an attack against a creature: the first one on each turn used
     * up the brand's Advantage. The attacker's client usually does not own the
     * branded creature, so the update is routed through the GM.
     */
    static async recordAttack(actor, {
        combat = globalThis.game?.combat ?? null,
        executeMacro = globalThis.game?.transformations?.executeMacro ?? null
    } = {})
    {
        if (!actor || !this.hasAttackVulnerability(actor)) return false
        if (!this.isFirstAttackThisTurn(actor, combat)) return false
        if (!this.getTurnKey(combat)) return false

        if (actor.isOwner) {
            return this.markAttacked(actor, combat)
        }

        if (typeof executeMacro !== "function") return false

        await executeMacro({
            trigger: "on",
            transformationType: "fiend",
            action: DAEMONIC_BRAND_ATTACKED_ACTION,
            args: {
                actorUuid: actor.uuid
            }
        })
        return true
    }

    /**
     * Records an attack roll against every targeted creature (tokens or actors).
     */
    static async recordAttackAgainstTargets(targets = null, options = {})
    {
        const candidates = targets ?? globalThis.game?.user?.targets ?? []
        const actors = new Set()

        for (const target of candidates) {
            const actor = target?.actor ?? target
            if (actor?.uuid) actors.add(actor)
        }

        let recorded = false
        for (const actor of actors) {
            recorded = (await this.recordAttack(actor, options)) || recorded
        }

        return recorded
    }
}
