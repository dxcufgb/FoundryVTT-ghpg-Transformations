import { Transformation } from "../../Transformation.js"
import { BlindingRadiance } from "./Feats/BlindingRadiance.js"
import { CleanseAffliction } from "./Feats/CleanseAffliction.js"
import {
    SERAPH_CORRUPTION_EFFECT_UUID,
    SeraphCorruption
} from "./Feats/SeraphCorruption.js"
import { renderSyntheticMidiActivityCard } from "../../../../ui/chatCards/SyntheticMidiActivityCard.js"

export { SERAPH_CORRUPTION_EFFECT_UUID }

// Flaws are not Seraph powers: using their activities (the GM applying
// Beacon to Darkness, the Seraph Corruption over-time damage) must not call
// for a Blinding Radiance save.
export const SERAPH_FLAW_ITEM_IDENTIFIERS = Object.freeze([
    "beacon-to-darkness",
    "seraph-corruption"
])

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Seraph extends Transformation
{
    static type = "seraph"
    static displayName = "Seraph"
    static itemId = "seraph"
    static uuid = "Compendium.transformations.gh-transformations.Item.0RQPtoc3ezLChL8o"

    static async onPreUseActivity({
        activity,
        usageConfig,
        dialogConfig,
        messageConfig,
        actor
    } = {})
    {
        BlindingRadiance.onPreUseActivity({
            activity,
            usageConfig,
            dialogConfig,
            messageConfig,
            actor
        })
    }

    static async onActivityUse(
        activity,
        usage,
        message,
        actorRepository,
        ChatMessagePartInjector,
        itemRepository,
        dialogFactory,
        triggeringUserId
    )
    {
        CleanseAffliction.onActivityUse({
            activity,
            usage,
            actor: usage?.workflow?.actor ?? activity?.actor ?? null,
            dialogFactory,
            triggeringUserId,
            logger: this.logger
        })

        if (!shouldSkipSeraphActivityUseTrigger({activity, usage})) {
            return {
                skipActivityUseTrigger: false
            }
        }

        usage.flags ??= {}
        usage.flags.transformations ??= {}
        usage.flags.transformations.skipActivityUseTrigger = true

        return {
            skipActivityUseTrigger: true
        }
    }

    static async onRenderChatMessage({
        message,
        html,
        actor,
        ChatMessagePartInjector
    } = {})
    {
        await BlindingRadiance.onRenderChatMessage({
            message,
            html,
            actor,
            ChatMessagePartInjector
        })
    }

    static async createActiveEffect({
        effect,
        actor,
        logger
    } = {})
    {
        if (!this.isSeraphCorruptionEffect(effect)) return null

        const resolvedActor = actor ?? effect?.parent ?? null
        if (!resolvedActor) return null

        const content = await buildSeraphCorruptionAppliedMessage(effect, resolvedActor)
        logger?.debug?.("Seraph Corruption applied", {
            actor: resolvedActor,
            effect
        })

        const message = await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: resolvedActor }),
            content
        })

        try {
            await SeraphCorruption.onCorruptionApplied(resolvedActor)
        } catch (error) {
            logger?.warn?.("Seraph Corruption start-up cleanup failed", error)
        }

        return message
    }

    static async onPreRollAttack({
        actor
    } = {})
    {
        this.logger?.debug?.("Seraph.onPreRollAttack", {actor})
        await SeraphCorruption.recordAttack(actor)
    }

    static async onPreRollSavingThrowAsAttacker(context, attacker, data = {})
    {
        this.logger?.debug?.("Seraph.onPreRollSavingThrowAsAttacker", attacker, context, data)
        SeraphCorruption.applySpellSaveAdvantage(context, attacker, data)
    }

    static isSeraphCorruptionEffect(effect)
    {
        return SeraphCorruption.isCorruptionEffect(effect)
    }
}

function shouldSkipSeraphActivityUseTrigger({
    activity,
    usage
} = {})
{
    return BlindingRadiance.isSaveActivity({activity, usage}) ||
        isSeraphFlawActivity({activity, usage})
}

function isSeraphFlawActivity({
    activity,
    usage
} = {})
{
    const item =
              usage?.workflow?.item ??
              activity?.item ??
              activity?.parent?.parent ??
              null
    const identifier = item?.system?.identifier ?? ""

    return SERAPH_FLAW_ITEM_IDENTIFIERS.includes(identifier)
}

async function buildSeraphCorruptionAppliedMessage(effect, actor)
{
    const effectName = escapeHtml(String(effect?.name ?? "Seraph Corruption"))
    const description = normalizeDescriptionHtml(
        resolveEffectDescription(effect)
    )

    return renderSyntheticMidiActivityCard({
        actor,
        item: {
            id: effect?.id,
            uuid: effect?.uuid,
            name: effect?.name ?? "Seraph Corruption",
            img: effect?.img ?? effect?.icon
        },
        descriptionHtml: [
            `<p><strong>${effectName} has been applied.</strong></p>`,
            description
        ].filter(Boolean).join("")
    })
}

function resolveEffectDescription(effect)
{
    for (const candidate of [
        effect?.description,
        effect?.system?.description?.value,
        effect?.system?.description
    ]) {
        if (typeof candidate === "string" && candidate.trim().length > 0) {
            return candidate
        }

        if (
            candidate &&
            typeof candidate === "object" &&
            typeof candidate.value === "string" &&
            candidate.value.trim().length > 0
        ) {
            return candidate.value
        }
    }

    return ""
}

function normalizeDescriptionHtml(description)
{
    const text = String(description ?? "").trim()
    if (!text) return ""
    if (/<[a-z][\s\S]*>/i.test(text)) return text

    return text
    .split(/\n{2,}/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
    .join("")
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
