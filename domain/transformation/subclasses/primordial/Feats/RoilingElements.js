import {
    ROILING_ELEMENTS_SAVE_DC_BY_STAGE,
    ROILING_ELEMENTS_UUID
} from "../triggers/roilingElementsTriggerCommon.js"

const ROILING_ELEMENTS_ACTIVITY_ID = "CeVayhK6VQsMSFY8"
const ROILING_ELEMENTS_ACTIVITY_UUID =
          `${ROILING_ELEMENTS_UUID}.Activity.${ROILING_ELEMENTS_ACTIVITY_ID}`
const ROILING_ELEMENTS_ITEM_NAME = "Roiling Elements"

export class RoilingElements
{
    static onPreUseActivity({
        activity,
        usageConfig,
        dialogConfig,
        messageConfig,
        actor
    } = {})
    {
        if (!actor || !activity) return

        const item = this.resolveActivityItem(activity)
        const activityId = this.resolveActivityId(activity)
        const stage =
                  Number(actor?.flags?.transformations?.stage ??
                      actor?.getFlag?.("transformations", "stage") ??
                      0)
        const saveDc = ROILING_ELEMENTS_SAVE_DC_BY_STAGE[stage] ?? null

        if (!this.isSaveActivity({activity, item}) || !Number.isFinite(saveDc)) {
            return
        }

        this.applySaveDc({
            activity,
            item,
            activityId,
            usageConfig,
            dialogConfig,
            messageConfig,
            saveDc
        })
    }

    static applySaveDc({
        activity,
        item,
        activityId,
        usageConfig,
        dialogConfig,
        messageConfig,
        saveDc
    } = {})
    {
        this.applyPreparedSaveDc(activity, saveDc)
        this.persistSaveDc({item, activityId, saveDc})
        this.applyRootDcValue(dialogConfig, saveDc)
        this.applyRootDcValue(messageConfig, saveDc)
        this.applyRootDcValue(usageConfig, saveDc)
    }

    static isSaveActivity({
        activity,
        usage = null,
        item = this.resolveActivityItem(activity, usage)
    } = {})
    {
        const itemSourceUuid = this.resolveSourceUuid(item)
        const activitySourceUuid = this.resolveSourceUuid(activity)
        const activityId = this.resolveActivityId(activity)
        const itemName = item?.name ?? ""

        return (
            (itemSourceUuid === ROILING_ELEMENTS_UUID || itemName === ROILING_ELEMENTS_ITEM_NAME) &&
            (
                activityId === ROILING_ELEMENTS_ACTIVITY_ID ||
                activitySourceUuid === ROILING_ELEMENTS_ACTIVITY_UUID
            )
        )
    }

    static resolveActivityItem(activity, usage = null)
    {
        return (
            usage?.workflow?.item ??
            activity?.item ??
            activity?.parent?.parent ??
            activity?.parent ??
            null
        )
    }

    static resolveSourceUuid(document)
    {
        return (
            document?.flags?.transformations?.sourceUuid ??
            document?.flags?.core?.sourceId ??
            document?._stats?.compendiumSource ??
            document?.uuid ??
            null
        )
    }

    static resolveActivityId(activity)
    {
        return activity?.id ?? activity?._id ?? null
    }

    static assignSaveDc(target, saveDc)
    {
        if (!target || typeof target !== "object") return

        const value = String(saveDc)

        target.save ??= {}
        target.save.dc ??= {}
        target.save.dc.calculation = ""
        target.save.dc.formula = value
        target.save.dc.value = saveDc
    }

    static applyPreparedSaveDc(activity, saveDc)
    {
        if (!activity || typeof activity !== "object") return

        this.assignSaveDc(activity, saveDc)

        activity.system ??= {}
        this.assignSaveDc(activity.system, saveDc)

        activity.labels ??= {}
        activity.labels.save = this.buildSaveLabel(activity, saveDc)
    }

    static persistSaveDc({
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
            } catch {
            }
        }

        const refreshedActivity = item?.system?.activities?.get?.(activityId) ?? null
        if (refreshedActivity) {
            this.applyPreparedSaveDc(refreshedActivity, saveDc)
        }
    }

    static applyRootDcValue(target, saveDc)
    {
        if (!target || typeof target !== "object") return

        target.dc ??= {}
        target.dc.value = saveDc
    }

    static buildSaveLabel(activity, saveDc)
    {
        const ability = this.resolveActivityAbility(activity)
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

    static resolveActivityAbility(activity)
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
}
