import { Transformation } from "../../Transformation.js"
import {
    ROILING_ELEMENTS_SAVE_DC_BY_STAGE,
    ROILING_ELEMENTS_UUID
} from "./triggers/roilingElementsTriggerCommon.js"

const ROILING_ELEMENTS_ACTIVITY_ID = "CeVayhK6VQsMSFY8"
const ROILING_ELEMENTS_ACTIVITY_UUID =
          `${ROILING_ELEMENTS_UUID}.Activity.${ROILING_ELEMENTS_ACTIVITY_ID}`
const ROILING_ELEMENTS_ITEM_NAME = "Roiling Elements"

/**
 * Domain subclass scaffold.
 * Leave UUID placeholders empty until the Foundry items exist.
 */
export class Primordial extends Transformation
{
    static type = "primordial"
    static displayName = "Primordial"
    static itemId = "primordial"
    static uuid = "Compendium.transformations.gh-transformations.Item.y4A8YjHZgKPcZeRc"

    static async onPreUseActivity({
        activity,
        usageConfig,
        dialogConfig,
        messageConfig,
        actor
    } = {})
    {
        if (!actor || !activity) return

        const item =
                  resolveActivityItem(activity)
        const activityId = resolveActivityId(activity)
        const stage =
                  Number(actor?.flags?.transformations?.stage ??
                      actor?.getFlag?.("transformations", "stage") ??
                      0)
        const saveDc = ROILING_ELEMENTS_SAVE_DC_BY_STAGE[stage] ?? null

        if (
            !isRoilingElementsSaveActivity({activity, item}) ||
            !Number.isFinite(saveDc)
        ) {
            return
        }

        applyRoilingElementsSaveDc({
            activity,
            item,
            activityId,
            usageConfig,
            dialogConfig,
            messageConfig,
            saveDc
        })
    }

    static async onActivityUse(activity, usage)
    {
        if (!isRoilingElementsSaveActivity({activity, usage})) {
            return
        }

        usage.flags ??= {}
        usage.flags.transformations ??= {}
        usage.flags.transformations.skipActivityUseTrigger = true
    }
}

function applyRoilingElementsSaveDc({
    activity,
    item,
    activityId,
    usageConfig,
    dialogConfig,
    messageConfig,
    saveDc
} = {})
{
    const value = String(saveDc)

    applyPreparedRoilingElementsSaveDc(activity, saveDc)
    persistRoilingElementsSaveDc({item, activityId, saveDc})
    applyRootDcValue(dialogConfig, saveDc)
    applyRootDcValue(messageConfig, saveDc)
    applyRootDcValue(usageConfig, saveDc)
}

function isRoilingElementsSaveActivity({
    activity,
    usage = null,
    item = resolveActivityItem(activity, usage)
} = {})
{
    const itemSourceUuid = resolveSourceUuid(item)
    const activitySourceUuid = resolveSourceUuid(activity)
    const activityId = resolveActivityId(activity)
    const itemName = item?.name ?? ""

    return (
        (itemSourceUuid === ROILING_ELEMENTS_UUID || itemName === ROILING_ELEMENTS_ITEM_NAME) &&
        (
            activityId === ROILING_ELEMENTS_ACTIVITY_ID ||
            activitySourceUuid === ROILING_ELEMENTS_ACTIVITY_UUID
        )
    )
}

function resolveActivityItem(activity, usage = null)
{
    return (
        usage?.workflow?.item ??
        activity?.item ??
        activity?.parent?.parent ??
        activity?.parent ??
        null
    )
}

function resolveSourceUuid(document)
{
    return (
        document?.flags?.transformations?.sourceUuid ??
        document?.flags?.core?.sourceId ??
        document?._stats?.compendiumSource ??
        document?.uuid ??
        null
    )
}

function resolveActivityId(activity)
{
    return activity?.id ?? activity?._id ?? null
}

function assignSaveDc(target, saveDc)
{
    if (!target || typeof target !== "object") return

    const value = String(saveDc)

    target.save ??= {}
    target.save.dc ??= {}
    target.save.dc.calculation = ""
    target.save.dc.formula = value
    target.save.dc.value = saveDc
}

function applyPreparedRoilingElementsSaveDc(activity, saveDc)
{
    if (!activity || typeof activity !== "object") return

    assignSaveDc(activity, saveDc)

    activity.system ??= {}
    assignSaveDc(activity.system, saveDc)

    activity.labels ??= {}
    activity.labels.save = buildRoilingElementsSaveLabel(activity, saveDc)
}

function persistRoilingElementsSaveDc({
    item,
    activityId,
    saveDc
} = {})
{
    if (!item || !activityId) return

    const value = String(saveDc)
    const update = {
        [`system.activities.${activityId}.save.dc.calculation`]: "",
        [`system.activities.${activityId}.save.dc.formula`]: value
    }

    if (typeof item.updateSource === "function") {
        try {
            item.updateSource(update)
        } catch {}
    }

    const refreshedActivity = item?.system?.activities?.get?.(activityId) ?? null
    if (refreshedActivity) {
        applyPreparedRoilingElementsSaveDc(refreshedActivity, saveDc)
    }
}

function applyRootDcValue(target, saveDc)
{
    if (!target || typeof target !== "object") return

    target.dc ??= {}
    target.dc.value = saveDc
}

function buildRoilingElementsSaveLabel(activity, saveDc)
{
    const ability = resolveActivityAbility(activity)
    const abilityLabel = globalThis.CONFIG?.DND5E?.abilities?.[ability]?.label ?? ""
    const formatter = globalThis.game?.i18n?.format?.bind(globalThis.game.i18n)

    if (formatter) {
        return formatter("DND5E.SaveDC", {
            dc: saveDc,
            ability: abilityLabel
        })
    }

    return abilityLabel
        ? `DC ${saveDc} ${abilityLabel}`
        : `DC ${saveDc}`
}

function resolveActivityAbility(activity)
{
    if (typeof activity?.ability === "string" && activity.ability) {
        return activity.ability
    }

    const abilities = activity?.save?.ability

    if (Array.isArray(abilities)) {
        return abilities[0] ?? null
    }

    if (abilities instanceof Set) {
        return abilities.values().next().value ?? null
    }

    if (abilities?.first && typeof abilities.first === "function") {
        return abilities.first() ?? null
    }

    return null
}
