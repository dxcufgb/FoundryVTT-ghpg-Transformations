import {
    BLINDING_RADIANCE_SAVE_DC_BY_STAGE,
    BLINDING_RADIANCE_UUID
} from "../triggers/blindingRadianceTriggerCommon.js"
import { renderMidiRequestButtons } from "../../../../../ui/chatCards/MidiRequestButtons.js"

export const BLINDING_RADIANCE_ACTIVITY_ID = "aojBuPYkNJcrmOZS"
export const BLINDING_RADIANCE_ACTIVITY_UUID =
          `${BLINDING_RADIANCE_UUID}.Activity.${BLINDING_RADIANCE_ACTIVITY_ID}`

const BLINDING_RADIANCE_ITEM_NAME = "Blinding Radiance"
const BLINDING_RADIANCE_SAVE_ABILITY = "con"
const BLINDING_RADIANCE_SAVE_REQUEST_FLAG =
          "blindingRadianceSaveRequest"
const BLINDING_RADIANCE_MIDI_BUTTONS_SELECTOR = ".midi-buttons"

export class BlindingRadiance
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
        const saveDc = BLINDING_RADIANCE_SAVE_DC_BY_STAGE[stage] ?? null

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
        this.markSaveRequestMessage(messageConfig, saveDc)
    }

    static async onRenderChatMessage({
        message,
        html,
        actor,
        ChatMessagePartInjector
    } = {})
    {
        if (!actor?.isOwner || !message || !ChatMessagePartInjector) return
        if (!this.isFlaggedSaveRequestMessage(message)) return

        const root = resolveHtmlRoot(html)
        if (
            this.hasSaveRequestButton(root) ||
            String(message.content ?? "").includes("data-transformations-blinding-radiance-save-request")
        ) {
            return
        }

        const saveRequest = message.flags?.transformations?.[BLINDING_RADIANCE_SAVE_REQUEST_FLAG] ?? {}
        const buttonData = this.createSaveRequestButtonData(saveRequest)
        if (!buttonData) return

        await ChatMessagePartInjector.inject({
            message,
            selector: BLINDING_RADIANCE_MIDI_BUTTONS_SELECTOR,
            position: "afterbegin",
            html: renderMidiRequestButtons({
                buttons: [buttonData],
                rootAttributes: {
                    "data-transformations-blinding-radiance-save-request": ""
                }
            })
        })
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
                itemSourceUuids.has(BLINDING_RADIANCE_UUID) ||
                itemNames.has(BLINDING_RADIANCE_ITEM_NAME)
            ) &&
            (
                activityIds.has(BLINDING_RADIANCE_ACTIVITY_ID) ||
                activitySourceUuids.has(BLINDING_RADIANCE_ACTIVITY_UUID)
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

    static assignSaveAbility(
        target,
        ability = BLINDING_RADIANCE_SAVE_ABILITY
    )
    {
        if (!target || typeof target !== "object" || !ability) return

        target.save ??= {}
        target.save.ability = createAbilitySet(ability)
    }

    static applyPreparedSaveDc(activity, saveDc)
    {
        if (!activity || typeof activity !== "object") return

        this.assignSaveDc(activity, saveDc)
        this.assignSaveAbility(activity)

        activity.system ??= {}
        this.assignSaveDc(activity.system, saveDc)
        this.assignSaveAbility(activity.system)

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
            [`system.activities.${activityId}.save.ability`]: [
                BLINDING_RADIANCE_SAVE_ABILITY
            ],
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

    static markSaveRequestMessage(messageConfig, saveDc)
    {
        if (!messageConfig || typeof messageConfig !== "object") return

        messageConfig.data ??= {}
        messageConfig.data.flags ??= {}
        messageConfig.data.flags.transformations ??= {}
        messageConfig.data.flags.transformations[BLINDING_RADIANCE_SAVE_REQUEST_FLAG] = {
            type: "save",
            ability: BLINDING_RADIANCE_SAVE_ABILITY,
            dc: saveDc
        }
    }

    static isFlaggedSaveRequestMessage(message)
    {
        return Boolean(
            message?.flags?.transformations?.[BLINDING_RADIANCE_SAVE_REQUEST_FLAG]
        )
    }

    static hasSaveRequestButton(root)
    {
        if (!root || typeof root.querySelector !== "function") return false

        return Boolean(
            root.querySelector("[data-transformations-blinding-radiance-save-request]") ||
            root.querySelector('[data-action="rollSave"]') ||
            root.querySelector('[data-action="rollRequest"][data-type="save"]')
        )
    }

    static createSaveRequestButtonData({
        ability = BLINDING_RADIANCE_SAVE_ABILITY,
        dc = null
    } = {})
    {
        const numericDc = Number(dc)
        if (!ability || !Number.isFinite(numericDc)) return null

        return {
            icon: '<i class="fa-solid fa-shield-heart" inert></i>',
            visibleLabel: this.buildVisibleSaveRequestLabel({
                ability,
                dc: numericDc
            }),
            hiddenLabel: this.buildHiddenSaveRequestLabel(ability),
            dataset: {
                action: "rollRequest",
                visibility: "all",
                type: "save",
                ability,
                dc: String(numericDc)
            }
        }
    }

    static buildVisibleSaveRequestLabel({
        ability,
        dc
    } = {})
    {
        const abilityLabel = this.getSaveAbilityLabel(ability)
        const formatter = globalThis.game?.i18n?.format?.bind(globalThis.game.i18n)

        if (formatter) {
            return formatter("DND5E.SavingThrowDC", {
                dc,
                ability: abilityLabel
            })
        }

        return `DC ${dc} ${abilityLabel}`
    }

    static buildHiddenSaveRequestLabel(
        ability = BLINDING_RADIANCE_SAVE_ABILITY
    )
    {
        const abilityLabel = this.getSaveAbilityLabel(ability)
        const formatter = globalThis.game?.i18n?.format?.bind(globalThis.game.i18n)

        if (formatter) {
            return formatter("DND5E.SavePromptTitle", {
                ability: abilityLabel
            })
        }

        return `${abilityLabel} Saving Throw`
    }

    static getSaveAbilityLabel(ability = BLINDING_RADIANCE_SAVE_ABILITY)
    {
        return (
            globalThis.CONFIG?.DND5E?.abilities?.[ability]?.label ??
            ability?.toUpperCase?.() ??
            "Constitution"
        )
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

function createAbilitySet(ability)
{
    const abilities = new Set([ability])

    if (typeof abilities.first !== "function") {
        abilities.first = () => abilities.values().next().value ?? null
    }

    return abilities
}

function resolveHtmlRoot(html)
{
    if (!html) return null
    if (typeof html.querySelector === "function") return html
    if (typeof html[0]?.querySelector === "function") return html[0]
    return null
}
