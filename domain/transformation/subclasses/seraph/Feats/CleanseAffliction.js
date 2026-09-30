export const DIVINE_CLEMENCY_UUID =
                 "Compendium.transformations.gh-transformations.Item.bWIalvbrSuMrPvNT"
export const CLEANSE_AFFLICTION_UUID =
                 "Compendium.transformations.gh-transformations.Item.Sz5sOHIQ1y9QWdRF"
export const CLEANSE_AFFLICTION_ADVANTAGE_EFFECT_UUID =
                 `${CLEANSE_AFFLICTION_UUID}.ActiveEffect.d4cbJwirFGhBLBy2`

export const CLEANSE_AFFLICTION_CONDITIONS = Object.freeze([
    "blinded",
    "deafened",
    "paralyzed",
    "poisoned"
])

const DIVINE_CLEMENCY_IDENTIFIER = "divine-clemency"
const DIVINE_CLEMENCY_ITEM_NAME = "Divine Clemency"
const CLEANSE_AFFLICTION_IDENTIFIER = "cleanse-affliction"
const CLEANSE_AFFLICTION_ITEM_NAME = "Cleanse Affliction"
const CLEANSE_AFFLICTION_ADVANTAGE_SECONDS = 60
const WORKFLOW_COMPLETE_TIMEOUT_MS = 120000

/**
 * Cleanse Affliction: when Divine Clemency's Healing Word heals a creature,
 * that creature also gains Temporary Hit Points equal to the healing,
 * Advantage on its next D20 Test within a minute, and the Seraph ends one of
 * Blinded, Deafened, Paralyzed or Poisoned on it.
 */
export class CleanseAffliction
{
    static onActivityUse({
        activity,
        usage,
        actor,
        dialogFactory = null,
        triggeringUserId = null,
        logger = null
    } = {})
    {
        logger?.debug?.("CleanseAffliction.onActivityUse", {activity, usage, actor})
        if (!actor || !this.isDivineClemencySpellUse({activity, usage})) return false

        const cleanseItem = this.findCleanseAfflictionItem(actor)
        if (!cleanseItem) return false

        const workflow = usage?.workflow ?? null
        if (!workflow) return false

        this.whenWorkflowComplete(workflow, () =>
            this.applyToWorkflow({
                workflow,
                actor,
                cleanseItem,
                dialogFactory,
                triggeringUserId,
                logger
            }).catch(error =>
                logger?.warn?.("Cleanse Affliction failed", error)
            )
        )

        return true
    }

    static isDivineClemencySpellUse({activity, usage} = {})
    {
        const spellItem =
                  usage?.workflow?.item ??
                  activity?.item ??
                  activity?.parent?.parent ??
                  null
        if (spellItem?.type !== "spell") return false

        const linkedItem =
                  spellItem?.system?.linkedActivity?.item ??
                  resolveLinkedItemFromCachedFor(spellItem)

        return isMatchingItem(linkedItem, {
            uuid: DIVINE_CLEMENCY_UUID,
            identifier: DIVINE_CLEMENCY_IDENTIFIER,
            name: DIVINE_CLEMENCY_ITEM_NAME
        })
    }

    static findCleanseAfflictionItem(actor)
    {
        return actor?.items?.find?.(item =>
            isMatchingItem(item, {
                uuid: CLEANSE_AFFLICTION_UUID,
                identifier: CLEANSE_AFFLICTION_IDENTIFIER,
                name: CLEANSE_AFFLICTION_ITEM_NAME
            })
        ) ?? null
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

    static collectHealedTargets(workflow)
    {
        const healedTargets = []

        for (const entry of workflow?.damageList ?? []) {
            const hpGained = Number(entry?.newHP) - Number(entry?.oldHP)
            // A target the Healing Word reached at full HP regains nothing,
            // but still gets the Advantage and the condition removal.
            const wasHealed =
                      (Number.isFinite(hpGained) && hpGained > 0) ||
                      Number(entry?.healingAdjustedTotalDamage) < 0
            if (!wasHealed) continue
            const healed = Number.isFinite(hpGained) && hpGained > 0 ? hpGained : 0

            const targetActor = resolveDamageListActor(entry)
            if (!targetActor) continue

            healedTargets.push({
                actor: targetActor,
                healed
            })
        }

        return healedTargets
    }

    static async applyToWorkflow({
        workflow,
        actor,
        cleanseItem,
        dialogFactory = null,
        triggeringUserId = null,
        logger = null
    } = {})
    {
        logger?.debug?.("CleanseAffliction.applyToWorkflow", {workflow, actor})
        for (const {actor: targetActor, healed} of this.collectHealedTargets(workflow)) {
            await this.grantTemporaryHitPoints(targetActor, healed)
            await this.grantAdvantage(targetActor, cleanseItem)
            await this.endCondition({
                seraphActor: actor,
                targetActor,
                dialogFactory,
                triggeringUserId
            })
        }
    }

    static async grantTemporaryHitPoints(targetActor, healed)
    {
        const currentTemp = Number(targetActor?.system?.attributes?.hp?.temp ?? 0) || 0
        const amount = Math.floor(Number(healed) || 0)
        if (amount <= currentTemp) return

        await updateActorAsOwnerOrGM(targetActor, {
            "system.attributes.hp.temp": amount
        })
    }

    static async grantAdvantage(targetActor, cleanseItem)
    {
        const sourceEffect = await globalThis.fromUuid?.(CLEANSE_AFFLICTION_ADVANTAGE_EFFECT_UUID)
        if (!sourceEffect) return

        const effectData = this.buildAdvantageEffectData(sourceEffect, cleanseItem)
        await createEffectsAsOwnerOrGM(targetActor, [effectData])
    }

    static buildAdvantageEffectData(sourceEffect, cleanseItem)
    {
        const effectData = typeof sourceEffect?.toObject === "function"
            ? sourceEffect.toObject()
            : foundry.utils.deepClone(sourceEffect)

        delete effectData._id
        effectData.transfer = false
        effectData.disabled = false
        effectData.origin = cleanseItem?.uuid ?? CLEANSE_AFFLICTION_UUID
        effectData.duration = {
            ...(effectData.duration ?? {}),
            seconds: CLEANSE_AFFLICTION_ADVANTAGE_SECONDS,
            startTime: globalThis.game?.time?.worldTime ?? null
        }

        return effectData
    }

    static getRemovableConditions(targetActor)
    {
        const statuses = targetActor?.statuses
        if (!statuses?.has) return []

        return CLEANSE_AFFLICTION_CONDITIONS.filter(status => statuses.has(status))
    }

    static async endCondition({
        seraphActor,
        targetActor,
        dialogFactory = null,
        triggeringUserId = null
    } = {})
    {
        const conditions = this.getRemovableConditions(targetActor)
        if (!conditions.length) return null

        let condition = conditions[0]
        if (conditions.length > 1 && dialogFactory?.openTransformationGeneralChoiceDialog) {
            const statusEffects = globalThis.CONFIG?.statusEffects ?? []
            const selected = await dialogFactory.openTransformationGeneralChoiceDialog({
                actor: seraphActor,
                choices: conditions.map(status =>
                {
                    const statusEffect = statusEffects.find(entry => entry.id === status)
                    return {
                        id: status,
                        icon: statusEffect?.img ?? statusEffect?.icon ?? "",
                        label: globalThis.game?.i18n?.localize?.(statusEffect?.name ?? status) ?? status
                    }
                }),
                title: "Cleanse Affliction: end a condition",
                description: `Choose the condition to end on ${targetActor?.name ?? "the target"}.`,
                triggeringUserId
            })
            const chosen = Array.isArray(selected) ? selected[0] : selected
            if (!conditions.includes(chosen)) return null
            condition = chosen
        }

        await removeConditionAsOwnerOrGM(targetActor, condition)
        return condition
    }
}

function isMatchingItem(item, {uuid, identifier, name} = {})
{
    if (!item) return false

    const sourceUuids = [
        item?.flags?.transformations?.sourceUuid,
        item?._stats?.compendiumSource,
        item?.flags?.core?.sourceId,
        item?.uuid
    ]
    if (sourceUuids.includes(uuid)) return true
    if (identifier && item?.system?.identifier === identifier) return true

    return Boolean(name) && item?.name === name
}

function resolveLinkedItemFromCachedFor(spellItem)
{
    const cachedFor = spellItem?.flags?.dnd5e?.cachedFor
    const actor = spellItem?.actor ?? spellItem?.parent ?? null
    if (typeof cachedFor !== "string" || !actor?.items?.get) return null

    const match = cachedFor.match(/Item\.([^.]+)\.Activity\./)
    return match ? actor.items.get(match[1]) ?? null : null
}

function resolveDamageListActor(entry)
{
    const fromUuidSync = globalThis.fromUuidSync
    if (typeof fromUuidSync !== "function") return null

    for (const uuid of [entry?.actorUuid, entry?.tokenUuid]) {
        if (typeof uuid !== "string" || !uuid) continue

        const document = fromUuidSync(uuid)
        const actor = document?.actor ?? document
        if (actor?.system?.attributes?.hp) return actor
    }

    return null
}

function getMidiSocket()
{
    return globalThis.MidiQOL?.socket?.() ?? null
}

async function updateActorAsOwnerOrGM(actor, updates)
{
    if (!actor) return
    if (actor.isOwner) return actor.update(updates)

    return getMidiSocket()?.executeAsGM?.("updateActor", {
        actorUuid: actor.uuid,
        updates
    })
}

async function createEffectsAsOwnerOrGM(actor, effects)
{
    if (!actor || !effects?.length) return
    if (actor.isOwner) return actor.createEmbeddedDocuments("ActiveEffect", effects)

    return getMidiSocket()?.executeAsGM?.("createEffects", {
        actorUuid: actor.uuid,
        effects
    })
}

async function removeConditionAsOwnerOrGM(actor, condition)
{
    if (!actor || !condition) return

    const effectIds = (actor.effects?.contents ?? Array.from(actor.effects ?? []))
    .filter(effect => effect?.statuses?.has?.(condition))
    .map(effect => effect.id)

    if (effectIds.length) {
        if (actor.isOwner) return actor.deleteEmbeddedDocuments("ActiveEffect", effectIds)

        return getMidiSocket()?.executeAsGM?.("removeEffects", {
            actorUuid: actor.uuid,
            effects: effectIds
        })
    }

    if (actor.isOwner) return actor.toggleStatusEffect?.(condition, {active: false})

    return getMidiSocket()?.executeAsGM?.("toggleStatusEffect", {
        actorUuid: actor.uuid,
        statusId: condition,
        options: {active: false}
    })
}
