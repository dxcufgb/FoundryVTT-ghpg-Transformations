import { Transformation } from "../../Transformation.js"
import { BlindingRadiance } from "./Feats/BlindingRadiance.js"
import { renderSyntheticMidiActivityCard } from "../../../../ui/chatCards/SyntheticMidiActivityCard.js"

export const SERAPH_CORRUPTION_EFFECT_UUID =
          "Compendium.transformations.gh-transformations.Item.nbEepKdcM50RJvbI.ActiveEffect.jtTKgErRNcmd9Ewh"

const SERAPH_CORRUPTION_EFFECT_NAME = "seraph corruption"

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
        usage
    )
    {
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

        return ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: resolvedActor }),
            content
        })
    }

    static isSeraphCorruptionEffect(effect)
    {
        if (!effect) return false

        return resolveEffectSourceUuids(effect).has(SERAPH_CORRUPTION_EFFECT_UUID) ||
            String(effect?.name ?? "").trim().toLowerCase() ===
            SERAPH_CORRUPTION_EFFECT_NAME
    }
}

function shouldSkipSeraphActivityUseTrigger({
    activity,
    usage
} = {})
{
    return BlindingRadiance.isSaveActivity({activity, usage})
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

function resolveEffectSourceUuids(effect)
{
    const sourceUuids = new Set()

    for (const candidate of [
        effect?.flags?.transformations?.sourceUuid,
        effect?.getFlag?.("transformations", "sourceUuid"),
        effect?.flags?.transformations?.grantedBy?.sourceUuid,
        effect?.getFlag?.("transformations", "grantedBy")?.sourceUuid,
        effect?.flags?.core?.sourceId,
        effect?._stats?.compendiumSource,
        effect?.origin,
        effect?.uuid
    ]) {
        if (typeof candidate === "string" && candidate.length > 0) {
            sourceUuids.add(candidate)
        }
    }

    return sourceUuids
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
