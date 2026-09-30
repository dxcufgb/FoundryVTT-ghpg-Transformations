export const AURA_OF_HOLY_PURGE_UUID =
                 "Compendium.transformations.gh-transformations.Item.PZPpHME9RtoA1TXo"
export const AURA_OF_RIGHTEOUS_MERCY_UUID =
                 "Compendium.transformations.gh-transformations.Item.D7EkVFh6Tre3FfgI"

export const HOLY_PURGE = "holyPurge"
export const RIGHTEOUS_MERCY = "righteousMercy"

// Name of the global the Holy Purge aura effect's
// flags.midi-qol.optional.holyPurge.macroToCall ("function.<global>...")
// calls when an ally uses the Critical Hit reaction.
export const SERAPH_AURAS_GLOBAL = "TransformationsSeraphAuras"

// How long the aura's owner has to answer the Righteous Mercy prompt before
// the damage goes through as normal.
export const RIGHTEOUS_MERCY_PROMPT_TIMEOUT_MS = 60000

const AURA_DEFINITIONS = Object.freeze({
    [HOLY_PURGE]: Object.freeze({
        key: HOLY_PURGE,
        name: "Aura of Holy Purge",
        identifier: "aura-of-holy-purge",
        uuid: AURA_OF_HOLY_PURGE_UUID,
        img: "modules/transformations/Icons/Transformations/Seraph/Aura%20of%20Holy%20Purge.png",
        // A negative countAlt stops midi-qol from offering the optional
        // Critical Hit until the marker effect is gone ("0" would be parsed
        // to 0, which midi-qol reads as "no limit").
        markerChanges: Object.freeze([
            Object.freeze({
                key: "flags.midi-qol.optional.holyPurge.countAlt",
                mode: 5,
                value: "-1",
                priority: 20
            })
        ])
    }),
    [RIGHTEOUS_MERCY]: Object.freeze({
        key: RIGHTEOUS_MERCY,
        name: "Aura of Righteous Mercy",
        identifier: "aura-of-righteous-mercy",
        uuid: AURA_OF_RIGHTEOUS_MERCY_UUID,
        img: "modules/transformations/Icons/Transformations/Seraph/Aura%20of%20Righteous%20Mercy.png",
        markerChanges: Object.freeze([])
    })
})

// actor key -> time the Hit Point was held. An entry older than this is
// stale (the update was vetoed or failed, so updateActor never cleared it).
const PENDING_RIGHTEOUS_MERCY_STALE_MS = RIGHTEOUS_MERCY_PROMPT_TIMEOUT_MS * 2
const pendingRighteousMercy = new Map()
let hooksRegistered = false

function isRighteousMercyPending(actorKey)
{
    const startedAt = pendingRighteousMercy.get(actorKey)
    if (startedAt === undefined) return false
    if (Date.now() - startedAt < PENDING_RIGHTEOUS_MERCY_STALE_MS) return true

    pendingRighteousMercy.delete(actorKey)
    return false
}

/**
 * Aura of Holy Purge and Aura of Righteous Mercy (Seraph Stage 4 boons).
 *
 * The auras themselves are Aura Effects applied to allies within 20 feet.
 * This class handles the parts that need code: the Righteous Mercy reaction
 * (drop to 1 Hit Point instead of 0), and for both auras the Exhaustion for
 * the ally and the Seraph and the once-per-Long-Rest limit, which is a marker
 * effect on the ally that DAE removes when the ally finishes a Long Rest.
 */
export class SeraphAuras
{
    static getDefinition(auraKey)
    {
        return AURA_DEFINITIONS[auraKey] ?? null
    }

    static register({hooks = globalThis.Hooks} = {})
    {
        if (hooksRegistered || !hooks?.on) return false
        hooksRegistered = true

        globalThis[SERAPH_AURAS_GLOBAL] = this

        hooks.on("preUpdateActor", (actor, changed, options, userId) =>
        {
            try {
                this.onPreUpdateActor(actor, changed, options, userId)
            } catch (error) {
                getLogger()?.error?.("Aura of Righteous Mercy check failed", error)
            }
        })

        hooks.on("updateActor", (actor, changed, options, userId) =>
        {
            this.onUpdateActor(actor, changed, options, userId)
        })

        hooks.on("dnd5e.restCompleted", (actor, result) =>
        {
            this.onRestCompleted(actor, result).catch(error =>
                getLogger()?.warn?.("Seraph aura long rest cleanup failed", error)
            )
        })

        return true
    }

    /**
     * Finds the aura effect the Seraph's aura applied to this ally, and the
     * Seraph it came from.
     */
    static findAuraContext(actor, auraKey)
    {
        const definition = this.getDefinition(auraKey)
        if (!actor || !definition) return null

        for (const effect of actor.appliedEffects ?? actor.effects ?? []) {
            if (effect?.disabled || effect?.isSuppressed) continue
            if (!effect?.flags?.auraeffects?.fromAura) continue

            const sourceEffect = resolveDocument(effect.origin)
            if (!isAuraEffect(effect, sourceEffect, definition)) continue

            const seraph = resolveEffectActor(sourceEffect)
            if (!seraph || seraph === actor || seraph.uuid === actor.uuid) continue
            if (seraph.statuses?.has?.("unconscious")) continue

            return {effect, sourceEffect, seraph}
        }

        return null
    }

    static findUsedMarker(actor, auraKey)
    {
        for (const effect of actor?.effects ?? []) {
            if (effect?.flags?.transformations?.seraphAuraUsed === auraKey) return effect
        }

        return null
    }

    static hasUsedAura(actor, auraKey)
    {
        return !!this.findUsedMarker(actor, auraKey)
    }

    static buildUsedMarkerData(auraKey, seraph = null)
    {
        const definition = this.getDefinition(auraKey)
        if (!definition) return null

        return {
            name: `${definition.name} (used)`,
            img: definition.img,
            origin: seraph?.uuid ?? definition.uuid,
            transfer: false,
            disabled: false,
            description: `<p>You have benefited from a Seraph's ${definition.name} and can't do so again until you finish a Long Rest.</p>`,
            changes: definition.markerChanges.map(change => ({...change})),
            duration: {seconds: null, rounds: null, turns: null},
            flags: {
                transformations: {seraphAuraUsed: auraKey},
                dae: {specialDuration: ["longRest"], showIcon: true}
            }
        }
    }

    /**
     * Must stay synchronous: Foundry sends the update as soon as the
     * preUpdateActor hooks return.
     */
    static onPreUpdateActor(actor, changed, options, userId)
    {
        getLogger()?.debug?.("SeraphAuras.onPreUpdateActor", {actor, changed, options, userId})
        if (options?.transformations?.righteousMercy) return false

        const nextHp = foundry.utils.getProperty(changed ?? {}, "system.attributes.hp.value")
        if (nextHp === undefined || nextHp === null) return false

        const currentHp = Number(actor?.system?.attributes?.hp?.value ?? 0)
        if (!(currentHp > 0) || Number(nextHp) > 0) return false

        const actorKey = actor?.uuid ?? actor?.id
        if (!actorKey || isRighteousMercyPending(actorKey)) return false
        if (this.hasUsedAura(actor, RIGHTEOUS_MERCY)) return false
        if (hasUsedReaction(actor)) return false

        if (!getDialogFactory()?.openTransformationGeneralChoiceDialog) return false

        const context = this.findAuraContext(actor, RIGHTEOUS_MERCY)
        if (!context || !options) return false

        // Hold the ally at 1 Hit Point while its owner decides; the prompt
        // starts from updateActor, once the held value is on the actor.
        foundry.utils.setProperty(changed, "system.attributes.hp.value", 1)
        foundry.utils.setProperty(options, "transformations.righteousMercyHeld", {
            seraphUuid: context.seraph.uuid
        })
        pendingRighteousMercy.set(actorKey, Date.now())

        return true
    }

    static onUpdateActor(actor, changed, options, userId)
    {
        const held = options?.transformations?.righteousMercyHeld
        if (!held) return false
        if (userId && userId !== globalThis.game?.user?.id) return false

        const actorKey = actor?.uuid ?? actor?.id
        const seraph = resolveDocument(held.seraphUuid)

        this.resolveRighteousMercy({actor, seraph})
        .catch(error => getLogger()?.warn?.("Aura of Righteous Mercy failed", error))
        .finally(() => pendingRighteousMercy.delete(actorKey))

        return true
    }

    static async resolveRighteousMercy({
        actor,
        seraph,
        dialogFactory = getDialogFactory(),
        timeoutMs = RIGHTEOUS_MERCY_PROMPT_TIMEOUT_MS,
        postMessage = true
    } = {})
    {
        getLogger()?.debug?.("SeraphAuras.resolveRighteousMercy", {actor, seraph})
        const accepted = await this.askRighteousMercy({actor, seraph, dialogFactory, timeoutMs})

        if (!accepted) {
            // Apply the Hit Point that was held back.
            const hp = Number(actor?.system?.attributes?.hp?.value ?? 0)
            await actor.update(
                {"system.attributes.hp.value": Math.max(hp - 1, 0)},
                {transformations: {righteousMercy: true}}
            )
            return false
        }

        await actor.update(
            {"system.attributes.hp.value": Math.max(Number(actor?.system?.attributes?.hp?.value ?? 0), 1)},
            {transformations: {righteousMercy: true}}
        )
        await setReactionUsed(actor)
        await this.applyAuraCost({actor, seraph, auraKey: RIGHTEOUS_MERCY, postMessage})
        return true
    }

    static async askRighteousMercy({
        actor,
        seraph,
        dialogFactory = null,
        timeoutMs = RIGHTEOUS_MERCY_PROMPT_TIMEOUT_MS
    } = {})
    {
        if (!dialogFactory?.openTransformationGeneralChoiceDialog) return false

        const definition = this.getDefinition(RIGHTEOUS_MERCY)
        const choice = dialogFactory.openTransformationGeneralChoiceDialog({
            actor,
            choices: [
                {
                    id: "use",
                    icon: definition.img,
                    label: "Use your Reaction: drop to 1 Hit Point instead"
                },
                {
                    id: "decline",
                    icon: "icons/svg/skull.svg",
                    label: "Drop to 0 Hit Points"
                }
            ],
            title: definition.name,
            description: `${actor?.name ?? "You"} would drop to 0 Hit Points inside ${seraph?.name ?? "the Seraph"}'s ${definition.name}. ` +
                "Use your Reaction to drop to 1 Hit Point instead? You and the Seraph each gain 1 Exhaustion level, " +
                "and you can't do this again until you finish a Long Rest.",
            triggeringUserId: resolvePromptUserId(actor)
        })

        let timeoutId = null
        const timeout = new Promise(resolve =>
        {
            timeoutId = setTimeout(() => resolve(null), timeoutMs)
        })

        try {
            const selected = await Promise.race([choice, timeout])
            const chosen = Array.isArray(selected) ? selected[0] : selected
            return chosen === "use"
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Called through flags.midi-qol.optional.holyPurge.macroToCall when an
     * ally in the Aura of Holy Purge turns a hit into a Critical Hit.
     * midi-qol then consumes the optional from the first applied effect
     * carrying a holyPurge change, which is the older aura effect rather than
     * the marker created here.
     */
    static async onHolyPurgeUsed({actor, postMessage = true} = {})
    {
        getLogger()?.debug?.("SeraphAuras.onHolyPurgeUsed", {actor})
        const context = this.findAuraContext(actor, HOLY_PURGE)
        if (!context) return undefined

        await this.applyAuraCost({actor, seraph: context.seraph, auraKey: HOLY_PURGE, postMessage})

        // Leave the roll to midi-qol's "critical" handling.
        return undefined
    }

    /**
     * The ally and the Seraph each gain 1 Exhaustion level, and the ally
     * can't benefit from the aura again until it finishes a Long Rest.
     */
    static async applyAuraCost({actor, seraph, auraKey, postMessage = true} = {})
    {
        getLogger()?.debug?.("SeraphAuras.applyAuraCost", {actor, seraph, auraKey})
        if (!actor) return false

        await addExhaustion(actor)
        if (seraph && seraph !== actor) await addExhaustion(seraph)

        if (!this.hasUsedAura(actor, auraKey)) {
            const markerData = this.buildUsedMarkerData(auraKey, seraph)
            if (markerData) await createEffectsAsOwnerOrGM(actor, [markerData])
        }

        if (postMessage) {
            await postAuraUsedMessage({actor, seraph, definition: this.getDefinition(auraKey)})
        }
        return true
    }

    // Fallback for tables without DAE, which normally removes the marker
    // through its "longRest" special duration.
    static async onRestCompleted(actor, result)
    {
        if (!result?.longRest || !actor?.isOwner) return false
        if (globalThis.game?.modules?.get?.("dae")?.active) return false

        const markerIds = [HOLY_PURGE, RIGHTEOUS_MERCY]
        .map(auraKey => this.findUsedMarker(actor, auraKey)?.id)
        .filter(Boolean)
        if (!markerIds.length) return false

        await actor.deleteEmbeddedDocuments("ActiveEffect", markerIds)
        return true
    }

    static resetPendingRighteousMercy()
    {
        pendingRighteousMercy.clear()
    }
}

function isAuraEffect(effect, sourceEffect, definition)
{
    const sourceItem = sourceEffect?.parent?.documentName === "Item"
        ? sourceEffect.parent
        : null

    if (sourceItem) {
        if (sourceItem.system?.identifier === definition.identifier) return true
        if (sourceItem.flags?.transformations?.sourceUuid === definition.uuid) return true
        if (sourceItem._stats?.compendiumSource === definition.uuid) return true
    }

    const names = [
        effect?.name,
        sourceEffect?.name
    ].map(name => String(name ?? "").trim().toLowerCase())

    return names.includes(definition.name.toLowerCase())
}

function resolveDocument(uuid)
{
    if (typeof uuid !== "string" || !uuid) return null

    try {
        return globalThis.fromUuidSync?.(uuid) ?? null
    } catch (error) {
        return null
    }
}

function resolveEffectActor(effect)
{
    const parent = effect?.parent ?? null
    if (!parent) return null
    if (parent.documentName === "Actor") return parent

    return parent.actor ?? parent.parent ?? null
}

function resolvePromptUserId(actor)
{
    const users = Array.from(globalThis.game?.users ?? [])
    const activeOwners = users.filter(user =>
        user?.active &&
        !user.isGM &&
        actor?.testUserPermission?.(user, "OWNER")
    )

    const assigned = activeOwners.find(user =>
        user.character === actor ||
        (user.character?.id && user.character.id === actor?.id)
    )
    if (assigned) return assigned.id
    if (activeOwners.length) return activeOwners[0].id

    const activeGm = users.find(user => user?.active && user.isGM)
    return activeGm?.id ?? globalThis.game?.user?.id ?? null
}

function hasUsedReaction(actor)
{
    try {
        return globalThis.MidiQOL?.hasUsedReaction?.(actor) === true
    } catch (error) {
        return false
    }
}

async function setReactionUsed(actor)
{
    if (!actor?.isOwner) return
    await globalThis.MidiQOL?.setReactionUsed?.(actor)
}

async function addExhaustion(actor)
{
    const current = Number(actor?.system?.attributes?.exhaustion ?? 0) || 0
    const max = Number(globalThis.CONFIG?.DND5E?.conditionTypes?.exhaustion?.levels ?? 6) || 6
    if (current >= max) return

    await updateActorAsOwnerOrGM(actor, {"system.attributes.exhaustion": current + 1})
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

async function postAuraUsedMessage({actor, seraph, definition} = {})
{
    const chatMessage = globalThis.ChatMessage
    if (!chatMessage?.create || !definition) return null

    const outcome = definition.key === RIGHTEOUS_MERCY
        ? "drops to 1 Hit Point instead of 0"
        : "turns the hit into a Critical Hit"

    return chatMessage.create({
        speaker: chatMessage.getSpeaker?.({actor}),
        content: `<p><strong>${escapeHtml(definition.name)}</strong>: ${escapeHtml(actor?.name ?? "The ally")} ` +
            `uses their Reaction and ${outcome}. ${escapeHtml(actor?.name ?? "The ally")} and ` +
            `${escapeHtml(seraph?.name ?? "the Seraph")} each gain 1 Exhaustion level.</p>`
    })
}

function getLogger()
{
    return globalThis.game?.transformations?.logger ?? null
}

function getDialogFactory()
{
    return globalThis.game?.transformations?.getDialogFactory?.() ?? null
}

function escapeHtml(value)
{
    return String(value ?? "").replace(/[&<>"']/g, character =>
        ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#39;"
        }[character])
    )
}
