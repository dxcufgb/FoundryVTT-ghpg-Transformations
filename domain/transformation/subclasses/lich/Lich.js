import { Transformation } from "../../Transformation.js"
import { MemoriLichdomNecroticDamage } from "./activities/memoriLichdomNecroticDamage.js"
import { LichMagicaRegainSpellSlots } from "./activities/LichMagicaRegainSpellSlots.js"

const SOUL_VESSEL_NAME = "Soul Vessel"
const SOUL_VESSEL_FLAG_PATH = "flags.transformations.lich.soulVesselCharged"
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
                ) {
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
                ) {
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

    static async preUpdateItem({
        item,
        changed,
        options = {}
    })
    {
        if (item?.name !== SOUL_VESSEL_NAME) return

        const nextUses = resolveSoulVesselUses({item, changed})
        if (nextUses == null) return

        const isCharged = Number(nextUses) !== 0
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
                  resolveSoulVesselUses({
                      item,
                      changed,
                      allowCurrentValueFallback: true
                  })

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
