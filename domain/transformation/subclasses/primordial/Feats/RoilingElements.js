import {
    ROILING_ELEMENTS_SAVE_DC_BY_STAGE,
    ROILING_ELEMENTS_UUID
} from "../triggers/roilingElementsTriggerCommon.js"

const ROILING_ELEMENTS_ACTIVITY_ID = "CeVayhK6VQsMSFY8"
const ROILING_ELEMENTS_ACTIVITY_UUID =
          `${ROILING_ELEMENTS_UUID}.Activity.${ROILING_ELEMENTS_ACTIVITY_ID}`
const ROILING_ELEMENTS_ITEM_NAME = "Roiling Elements"
const EXCLUDED_ACTIVITY_USE_TRIGGERS = Object.freeze([
    {
        itemUuid:
            "Compendium.transformations.gh-transformations.Item.U1W6fCAmzOKBRmD5",
        activityId: "xtFaAokFhstQEHWy"
    },
    {
        itemUuid:
            "Compendium.transformations.gh-transformations.Item.ZNeHpSQXylLEUtN0",
        activityId: "bpcaabfmchqSE8HB"
    }
].map(entry => ({
    ...entry,
    activityUuid: `${entry.itemUuid}.Activity.${entry.activityId}`
})))

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
        const itemSourceUuids = this.resolveSourceUuids(item)
        const activitySourceUuids = this.resolveActivitySourceUuids({
            activity,
            usage
        })
        const activityIds = this.resolveActivityIds({
            activity,
            usage
        })
        const itemNames = this.resolveItemNames({
            activity,
            usage,
            item
        })

        return (
            (
                itemSourceUuids.has(ROILING_ELEMENTS_UUID) ||
                itemNames.has(ROILING_ELEMENTS_ITEM_NAME)
            ) &&
            (
                activityIds.has(ROILING_ELEMENTS_ACTIVITY_ID) ||
                activitySourceUuids.has(ROILING_ELEMENTS_ACTIVITY_UUID)
            )
        )
    }

    static isExcludedActivityUseTrigger({
        activity,
        usage = null,
        item = this.resolveActivityItem(activity, usage)
    } = {})
    {
        const itemSourceUuids = this.resolveSourceUuids(item)
        const activitySourceUuids = this.resolveActivitySourceUuids({
            activity,
            usage
        })
        const activityIds = this.resolveActivityIds({
            activity,
            usage
        })

        return EXCLUDED_ACTIVITY_USE_TRIGGERS.some(entry =>
            activitySourceUuids.has(entry.activityUuid) ||
            (
                itemSourceUuids.has(entry.itemUuid) &&
                activityIds.has(entry.activityId)
            )
        )
    }

    static resolveActivityItem(activity, usage = null)
    {
        return this.resolveActivityItems({
            activity,
            usage
        })[0] ?? null
    }

    static resolveSourceUuid(document)
    {
        return this.resolveSourceUuids(document).values().next().value ?? null
    }

    static resolveSourceUuids(document)
    {
        const sourceUuids = new Set()
        for (const candidate of [
            document?.flags?.transformations?.sourceUuid,
            document?.flags?.core?.sourceId,
            document?._stats?.compendiumSource,
            document?.uuid
        ]) {
            if (typeof candidate !== "string" || candidate.length === 0) {
                continue
            }

            sourceUuids.add(candidate)
        }

        return sourceUuids
    }

    static resolveActivitySourceUuids({
        activity,
        usage
    } = {})
    {
        const sourceUuids = new Set()

        for (const candidate of this.resolveActivityDocuments({
            activity,
            usage
        })) {
            for (const sourceUuid of this.resolveSourceUuids(candidate)) {
                sourceUuids.add(sourceUuid)
            }
        }

        return sourceUuids
    }

    static resolveActivityId(activity)
    {
        return this.resolveActivityIds({activity}).values().next().value ?? null
    }

    static resolveActivityIds({
        activity,
        usage = null
    } = {})
    {
        const activityIds = new Set()

        for (const candidate of this.resolveActivityDocuments({
            activity,
            usage
        })) {
            for (const activityId of [
                candidate?.id,
                candidate?._id
            ]) {
                if (typeof activityId !== "string" || activityId.length === 0) {
                    continue
                }

                activityIds.add(activityId)
            }
        }

        return activityIds
    }

    static resolveActivityDocuments({
        activity,
        usage = null
    } = {})
    {
        return compactUnique([
            activity,
            usage?.activity,
            usage?.workflow?.activity,
            activity?.activity
        ])
    }

    static resolveActivityItems({
        activity,
        usage = null
    } = {})
    {
        const activityDocuments = this.resolveActivityDocuments({
            activity,
            usage
        })

        return compactUnique([
            usage?.workflow?.item,
            usage?.item,
            usage?.workflow?.activity?.item,
            usage?.workflow?.activity?.parent?.parent,
            usage?.workflow?.activity?.parent,
            activity?.item,
            activity?.parent?.parent,
            activity?.parent,
            ...activityDocuments.flatMap(candidate => [
                candidate?.item,
                candidate?.parent?.parent,
                candidate?.parent
            ])
        ])
    }

    static resolveItemNames({
        activity,
        usage = null,
        item = null
    } = {})
    {
        const itemNames = new Set()
        const activityDocuments = this.resolveActivityDocuments({
            activity,
            usage
        })

        for (const candidate of compactUnique([
            item,
            ...this.resolveActivityItems({
                activity,
                usage
            }),
            ...activityDocuments
        ])) {
            const itemName = candidate?.name
            if (typeof itemName !== "string" || itemName.length === 0) {
                continue
            }

            itemNames.add(itemName)
        }

        return itemNames
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

function compactUnique(values)
{
    return [...new Set(values.filter(Boolean))]
}
