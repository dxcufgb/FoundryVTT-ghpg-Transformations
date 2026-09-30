import { Transformation } from "../../Transformation.js"
import { MemoriLichdomNecroticDamage } from "./activities/memoriLichdomNecroticDamage.js"
import { LichMagicaRegainSpellSlots } from "./activities/LichMagicaRegainSpellSlots.js"
import {
    SOUL_VESSEL_FLAG_PATH,
    SOUL_VESSEL_NAME,
    findSoulVessel,
    isSoulVesselCharged
} from "./soulVessel.js"

const INITIALISE_SOUL_VESSEL_SCRIPT = "initialiseSoulVessel"
const CONCENTRATION_LIMIT_KEY = "system.attributes.concentration.limit"
const ELDRITCH_CONCENTRATION_SECOND_FLAG = "eldritchConcentrationSecondUuid"
const ENFORCE_DISADVANTAGE_EFFECT_NAME = "Enforce Disadvantage"
const ENFORCE_DISADVANTAGE_EFFECT_ORIGIN_SUFFIX =
          "ActiveEffect.dQzYsMWKJw6E7rKc"
const ELDRITCH_CONCENTRATION_ITEM_NAME = "Eldritch Concentration"
const ELDRITCH_CONCENTRATION_ITEM_SOURCE_UUID =
          "Compendium.transformations.gh-transformations.Item.h0hvoW3lpVwBhbjk"

function getUpdatedUsesValue(changed)
{
    const nextUsesValue =
              foundry.utils.getProperty(changed, "system.uses.value") ??
              changed?.["system.uses.value"]

    if (nextUsesValue == null) return null

    const parsedValue = Number(nextUsesValue)
    return Number.isFinite(parsedValue) ? parsedValue : null
}

function getUpdatedUsesSpent(changed)
{
    const nextUsesSpent =
              foundry.utils.getProperty(changed, "system.uses.spent") ??
              changed?.["system.uses.spent"]

    if (nextUsesSpent == null) return null

    const parsedValue = Number(nextUsesSpent)
    return Number.isFinite(parsedValue) ? parsedValue : null
}

function getUpdatedUsesMax(item, changed)
{
    const nextUsesMax =
              foundry.utils.getProperty(changed, "system.uses.max") ??
              changed?.["system.uses.max"] ??
              item?.system?.uses?.max

    const parsedValue = Number(nextUsesMax)
    return Number.isFinite(parsedValue) ? parsedValue : 0
}

function resolveSoulVesselUses({
    item,
    changed,
    allowCurrentValueFallback = false
})
{
    const nextUsesValue = getUpdatedUsesValue(changed)
    if (nextUsesValue != null) return nextUsesValue

    const nextUsesSpent = getUpdatedUsesSpent(changed)
    if (nextUsesSpent != null) {
        return Math.max(getUpdatedUsesMax(item, changed) - nextUsesSpent, 0)
    }

    if (!allowCurrentValueFallback) return null

    const currentUsesValue = Number(item?.system?.uses?.value)
    if (Number.isFinite(currentUsesValue)) return currentUsesValue

    const currentUsesSpent = Number(item?.system?.uses?.spent)
    const currentUsesMax = Number(item?.system?.uses?.max)

    if (!Number.isFinite(currentUsesSpent) || !Number.isFinite(currentUsesMax)) {
        return null
    }

    return Math.max(currentUsesMax - currentUsesSpent, 0)
}

function setCachedSoulVesselChargedState(options, isCharged)
{
    options.transformations ??= {}
    options.transformations.lich ??= {}
    options.transformations.lich.soulVesselCharged = isCharged
}

function getCachedSoulVesselChargedState(options)
{
    return options?.transformations?.lich?.soulVesselCharged
}

function toChargedState(uses)
{
    if (uses == null) return null

    const parsedValue = Number(uses)
    return Number.isFinite(parsedValue) ? parsedValue > 0 : null
}

function resolveOriginatingMessageItem(...configs)
{
    for (const config of configs) {
        const messageId =
                  config?.data?.flags?.dnd5e?.originatingMessage ??
                  config?.flags?.dnd5e?.originatingMessage ??
                  null
        if (!messageId) continue

        const message = globalThis.game?.messages?.get?.(messageId)
        const item = message?.getAssociatedItem?.() ?? null
        if (item) return item
    }

    // dnd5e only records originatingMessage after the roll; before it, the
    // chat card that was clicked is reachable through the roll event.
    const eventMessageId =
              configs[0]?.event?.target?.closest?.("[data-message-id]")?.dataset?.messageId ?? null
    if (eventMessageId) {
        const message = globalThis.game?.messages?.get?.(eventMessageId)
        return message?.getAssociatedItem?.() ?? null
    }

    return null
}

function resolveWorkflowFromId(context)
{
    const workflowId = context?.midiOptions?.workflowId
    if (!workflowId) return null

    try {
        return globalThis.MidiQOL?.Workflow?.getWorkflow?.(workflowId) ?? null
    } catch {
        return null
    }
}

function resolveSaveItemFromUuid(context)
{
    const saveItemUuid = context?.midiOptions?.saveItemUuid
    if (!saveItemUuid || typeof globalThis.fromUuidSync !== "function") return null

    try {
        return globalThis.fromUuidSync(saveItemUuid) ?? null
    } catch {
        return null
    }
}

/**
 * Lich Magica only imposes Disadvantage on a save against one of the Lich's spells.
 */
function isSpellSave(context, dialog = null)
{
    const workflow =
              context?.workflow ??
              context?.midiOptions?.workflow ??
              resolveWorkflowFromId(context) ??
              null
    const item =
              workflow?.saveItem ??
              workflow?.item ??
              resolveSaveItemFromUuid(context) ??
              resolveOriginatingMessageItem(context, dialog) ??
              null

    return item?.type === "spell"
}

function getConcentratingStatus()
{
    return globalThis.CONFIG?.specialStatusEffects?.CONCENTRATING ?? "concentrating"
}

function isConcentrationEffect(effect)
{
    return effect?.statuses?.has?.(getConcentratingStatus()) === true
}

function isEldritchConcentrationEffect(effect)
{
    return (
        effect?.name === ELDRITCH_CONCENTRATION_ITEM_NAME &&
        (effect.changes ?? []).some(change => change?.key === CONCENTRATION_LIMIT_KEY)
    )
}

function getActorEffects(actor)
{
    const effects = actor?.effects
    if (!effects) return []

    return Array.isArray(effects) ? effects : Array.from(effects)
}

function findEldritchConcentrationEffect(actor)
{
    return getActorEffects(actor).find(isEldritchConcentrationEffect) ?? null
}

function getDependentOn(effect)
{
    return effect?.flags?.dnd5e?.dependentOn ?? null
}

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Lich extends Transformation
{
    static type = "lich"
    static displayName = "Lich"
    static itemId = "lich"
    static uuid = "Compendium.transformations.gh-transformations.Item.qCXHhnuwhElccjKq"

    static async onRenderChatMessage({
        message,
        html,
        actor,
        actorRepository,
        dialogFactory,
        ChatMessagePartInjector,
        RollService,
        logger
    })
    {
        if (!actor?.isOwner) return

        switch (message?.flags?.transformations?.lichActivity) {
            case MemoriLichdomNecroticDamage.id:
                MemoriLichdomNecroticDamage.bind({
                    actor,
                    message,
                    html,
                    actorRepository,
                    ChatMessagePartInjector,
                    RollService,
                    logger
                })
                break
            case LichMagicaRegainSpellSlots.id:
                LichMagicaRegainSpellSlots.bind({
                    actor,
                    message,
                    html,
                    dialogFactory,
                    ChatMessagePartInjector,
                    logger
                })
                break
        }
    }

    static async onPreRollSavingThrowAsAttacker(context, attacker, data = {})
    {
        this.logger?.debug?.("Lich.onPreRollSavingThrowAsAttacker", attacker, context, data)

        const effect = attacker?.effects?.find(effect =>
            effect.name === ENFORCE_DISADVANTAGE_EFFECT_NAME &&
            effect.origin?.endsWith(ENFORCE_DISADVANTAGE_EFFECT_ORIGIN_SUFFIX)
        )
        if (!effect) return
        if (!isSpellSave(context, data.dialog)) return

        const hasAdvantage =
                  context.advantage === true ||
                  context.rolls?.some(roll => roll.options?.advantage === true)

        context.disadvantage = true
        context.rolls?.forEach(roll =>
        {
            roll.options ??= {}
            roll.options.disadvantage = true
        })

        // The roll dialog highlights its default button from the dialog
        // options, which are computed before this hook runs.
        if (data.dialog) {
            const ADV_MODE = CONFIG.Dice.D20Roll.ADV_MODE

            data.dialog.options ??= {}
            data.dialog.options.advantageMode = hasAdvantage
                ? ADV_MODE.NORMAL
                : ADV_MODE.DISADVANTAGE
            data.dialog.options.defaultButton = hasAdvantage
                ? "normal"
                : "disadvantage"
        }

        this.logger?.debug?.(
            "Lich.onPreRollSavingThrowAsAttacker applied disadvantage",
            context,
            data.dialog
        )

        if (data.activeEffectRepository) {
            await data.activeEffectRepository.removeByIds(attacker, [effect.id])
        } else {
            await effect.delete()
        }
    }

    static async onActivityUse(
        activity,
        usage,
        message,
        actorRepository,
        ChatMessagePartInjector
    )
    {
        const itemSourceUuid =
                  usage?.workflow?.item?.flags?.transformations?.sourceUuid ??
                  activity?.parent?.parent?.flags?.transformations?.sourceUuid ??
                  activity?.parent?.flags?.transformations?.sourceUuid ??
                  null
        const itemName =
                  activity?.parent?.parent?.name ??
                  activity?.parent?.name ??
                  usage?.workflow?.item?.name ??
                  ""
        const activityName = activity?.name?.toLowerCase?.() ?? ""
        const actor = usage?.workflow?.actor
        const isEldritchConcentrationItem =
                  itemSourceUuid === ELDRITCH_CONCENTRATION_ITEM_SOURCE_UUID ||
                  itemName === ELDRITCH_CONCENTRATION_ITEM_NAME

        switch (activityName) {
            case "necrotic damage":
                if (
                    itemSourceUuid !== MemoriLichdomNecroticDamage.itemSourceUuid &&
                    itemName !== "Memori Lichdom"
                )
                {
                    return
                }

                await MemoriLichdomNecroticDamage.activityUse({
                    actor,
                    message,
                    actorRepository,
                    ChatMessagePartInjector
                })
                break
            case "regain spell slot":
                if (
                    itemSourceUuid !== LichMagicaRegainSpellSlots.itemSourceUuid &&
                    itemName !== "Lich Magica"
                )
                {
                    return
                }

                await LichMagicaRegainSpellSlots.activityUse({
                    actor,
                    message,
                    ChatMessagePartInjector
                })
                break
            case "eldritch concentration":
                if (!isEldritchConcentrationItem || !actor) {
                    return
                }

                const exhaustion = Number(actor.system?.attributes?.exhaustion) || 0
                await actor.update({
                    "system.attributes.exhaustion": Math.min(exhaustion + 1, 6)
                })
                break
        }
    }

    static async postCreateScript(actor, scriptName, context = {})
    {
        this.logger?.debug?.("Lich.postCreateScript", actor, scriptName, context)

        switch (scriptName) {
            case INITIALISE_SOUL_VESSEL_SCRIPT:
                await this.initialiseSoulVesselChargedFlag(actor)
                break
        }
    }

    /**
     * Writes the charged flag from the vessel's current uses, so effects keyed on
     * the flag (Necromantic Dystrophia) never read a stale value from an earlier vessel.
     */
    static async initialiseSoulVesselChargedFlag(actor)
    {
        this.logger?.debug?.("Lich.initialiseSoulVesselChargedFlag", actor)
        if (!actor || !findSoulVessel(actor)) return

        const isCharged = isSoulVesselCharged(actor)
        const currentState = actor.flags?.transformations?.lich?.soulVesselCharged
        if (currentState === isCharged) return

        await actor.update({
            [SOUL_VESSEL_FLAG_PATH]: isCharged
        })
    }

    /**
     * Eldritch Concentration: the extra concentration slot lasts only while both
     * spells are held. The Eldritch Concentration effect depends on the original
     * concentration, and the second concentration depends on the Eldritch effect,
     * so ending the original ends both. Ending the second is handled in
     * deleteActiveEffect.
     */
    static async createActiveEffect({
        effect,
        actor,
        logger
    } = {})
    {
        logger?.debug?.("Lich.createActiveEffect", {effect, actor})

        const resolvedActor = actor ?? effect?.parent ?? null
        if (!resolvedActor || !effect) return

        if (isEldritchConcentrationEffect(effect)) {
            if (getDependentOn(effect)) return

            const original = getActorEffects(resolvedActor).find(isConcentrationEffect)
            if (!original) return

            await effect.setFlag("dnd5e", "dependentOn", original.uuid)
            return
        }

        if (!isConcentrationEffect(effect)) return

        const eldritchEffect = findEldritchConcentrationEffect(resolvedActor)
        if (!eldritchEffect) return

        const anchorUuid = getDependentOn(eldritchEffect)
        if (!anchorUuid) {
            await eldritchEffect.setFlag("dnd5e", "dependentOn", effect.uuid)
            return
        }

        if (anchorUuid === effect.uuid) return
        if (eldritchEffect.flags?.transformations?.[ELDRITCH_CONCENTRATION_SECOND_FLAG]) return
        if (getDependentOn(effect)) return

        await eldritchEffect.setFlag(
            "transformations",
            ELDRITCH_CONCENTRATION_SECOND_FLAG,
            effect.uuid
        )
        await effect.setFlag("dnd5e", "dependentOn", eldritchEffect.uuid)
    }

    static async deleteActiveEffect({
        effect,
        actor,
        logger
    } = {})
    {
        logger?.debug?.("Lich.deleteActiveEffect", {effect, actor})

        const resolvedActor = actor ?? effect?.parent ?? null
        if (!resolvedActor || !isConcentrationEffect(effect)) return

        const eldritchEffect = findEldritchConcentrationEffect(resolvedActor)
        if (!eldritchEffect) return

        const secondUuid =
                  eldritchEffect.flags?.transformations?.[ELDRITCH_CONCENTRATION_SECOND_FLAG]
        if (!secondUuid || secondUuid !== effect.uuid) return

        // Losing the second spell loses the original too; ending the original
        // removes the Eldritch Concentration effect through its dependency.
        const anchorUuid = getDependentOn(eldritchEffect)
        const original = getActorEffects(resolvedActor).find(entry =>
            entry.uuid === anchorUuid
        )

        if (original) {
            if (typeof resolvedActor.endConcentration === "function") {
                await resolvedActor.endConcentration(original)
            } else {
                await original.delete()
            }
            return
        }

        await eldritchEffect.delete()
    }

    /**
     * Synchronous so the cached state reaches the update options when the
     * dispatcher calls it without awaiting (preUpdate* hooks cannot be awaited).
     */
    static preUpdateItem({
        item,
        changed,
        options = {}
    })
    {
        if (item?.name !== SOUL_VESSEL_NAME) return

        const isCharged = toChargedState(resolveSoulVesselUses({item, changed}))
        if (isCharged == null) return

        setCachedSoulVesselChargedState(options, isCharged)
        return isCharged
    }

    static async updateItem({
        item,
        changed,
        actor,
        options = {}
    })
    {
        if (item?.name !== SOUL_VESSEL_NAME || !actor) return

        const isCharged =
                  getCachedSoulVesselChargedState(options) ??
                  toChargedState(resolveSoulVesselUses({
                      item,
                      changed,
                      allowCurrentValueFallback: true
                  }))

        if (isCharged == null) return

        const currentState =
                  actor?.getFlag?.("transformations", "lich")?.soulVesselCharged ??
                  actor?.flags?.transformations?.lich?.soulVesselCharged

        if (currentState === isCharged) return

        await actor.update({
            [SOUL_VESSEL_FLAG_PATH]: isCharged
        })
    }
}
