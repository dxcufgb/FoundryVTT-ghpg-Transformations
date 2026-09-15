import { Transformation } from "../../Transformation.js"
import { ElementalImbalance } from "./Feats/ElementalImbalance.js"
import { RoilingElements } from "./Feats/RoilingElements.js"

export const PRIMORDIAL_EARTH_FEATURE_UUID =
          "Compendium.transformations.gh-transformations.Item.U1W6fCAmzOKBRmD5"

const ELEMENTAL_MASTERY_EARTH_EFFECT_NAME = "elemental mastery: earth"
const TEMP_HP_PATH = "system.attributes.hp.temp"

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
        RoilingElements.onPreUseActivity({
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
        message
    )
    {

        if (!shouldSkipPrimordialActivityUseTrigger({activity, usage})) {
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
        actorRepository,
        activeEffectRepository,
        ChatMessagePartInjector,
        RollService,
        logger
    })
    {
        if (message?.flags?.transformations?.primordialActivity === ElementalImbalance.id) {
            ElementalImbalance.bind({
                actor,
                message,
                html,
                activeEffectRepository,
                ChatMessagePartInjector,
                RollService,
                logger
            })

        }
    }

    static async onPreCalculateDamage({
        actor,
        damage,
        details,
        logger
    } = {})
    {
        if (!ElementalImbalance.actorHasFeat(actor)) return

        await ElementalImbalance.onPreCalculateDamage({
            actor,
            damage,
            details,
            logger
        })
    }

    static preUpdateActor({
        actor,
        changed,
        options,
        logger
    } = {})
    {
        return this.applyEarthTemporaryHpBonus({
            actor,
            changed,
            options,
            logger
        })
    }

    static applyEarthTemporaryHpBonus({
        actor,
        changed,
        options,
        logger
    } = {})
    {
        if (!actor || !changed) return false
        if (!this.actorHasEarthFeature(actor)) return false

        const changeStyle = getChangedPropertyStyle(changed, TEMP_HP_PATH)
        if (!changeStyle) return false

        const currentTempHp = Number(actor?.system?.attributes?.hp?.temp ?? 0)
        const nextTempHp = Number(
            getChangedProperty(changed, TEMP_HP_PATH, changeStyle)
        )
        const proficiencyBonus = Number(actor?.system?.attributes?.prof ?? 0)
        const explicitTempHpGain = Number(
            options?.transformations?.temporaryHpGain ?? NaN
        )
        const hasExplicitTempHpGain =
                  Number.isFinite(explicitTempHpGain) &&
                  explicitTempHpGain > 0

        if (
            !Number.isFinite(currentTempHp) ||
            !Number.isFinite(nextTempHp) ||
            !Number.isFinite(proficiencyBonus) ||
            proficiencyBonus <= 0 ||
            (!hasExplicitTempHpGain && nextTempHp <= currentTempHp)
        ) {
            return false
        }

        const gainedTempHp = hasExplicitTempHpGain
            ? explicitTempHpGain
            : nextTempHp
        const boostedGain = gainedTempHp + proficiencyBonus
        const resolvedTempHp = Math.max(
            currentTempHp,
            nextTempHp,
            boostedGain
        )

        if (resolvedTempHp === nextTempHp) return false

        setChangedProperty(changed, TEMP_HP_PATH, resolvedTempHp, changeStyle)
        logger?.debug?.("Primordial Earth boosted temporary HP", {
            actor,
            currentTempHp,
            nextTempHp,
            gainedTempHp,
            proficiencyBonus,
            resolvedTempHp
        })

        return true
    }

    static actorHasEarthFeature(actor)
    {
        return actorHasSourceUuid(actor?.items, PRIMORDIAL_EARTH_FEATURE_UUID) ||
            actorHasActiveEffect(actor, ELEMENTAL_MASTERY_EARTH_EFFECT_NAME)
    }
}

function shouldSkipPrimordialActivityUseTrigger({
    activity,
    usage
} = {})
{
    return RoilingElements.isSaveActivity({activity, usage}) ||
        RoilingElements.isExcludedActivityUseTrigger({activity, usage})
}

function actorHasSourceUuid(collection, sourceUuid)
{
    return collectionSome(collection, document =>
        resolveSourceUuids(document).has(sourceUuid)
    )
}

function actorHasActiveEffect(actor, normalizedName)
{
    return collectionSome(actor?.effects, effect =>
        effect?.disabled !== true &&
        String(effect?.name ?? "").trim().toLowerCase() === normalizedName
    )
}

function resolveSourceUuids(document)
{
    const sourceUuids = new Set()

    for (const candidate of [
        document?.flags?.transformations?.sourceUuid,
        document?.getFlag?.("transformations", "sourceUuid"),
        document?.flags?.core?.sourceId,
        document?._stats?.compendiumSource,
        document?.uuid
    ]) {
        if (typeof candidate === "string" && candidate.length > 0) {
            sourceUuids.add(candidate)
        }
    }

    return sourceUuids
}

function collectionSome(collection, predicate)
{
    if (!collection) return false

    if (typeof collection.some === "function") {
        return collection.some(predicate)
    }

    if (Array.isArray(collection.contents)) {
        return collection.contents.some(predicate)
    }

    if (typeof collection.values === "function") {
        return [...collection.values()].some(predicate)
    }

    if (typeof collection === "object") {
        return Object.values(collection).some(predicate)
    }

    return false
}

function getChangedPropertyStyle(target, path)
{
    if (hasOwnProperty(target, path)) return "flat"
    if (hasNestedProperty(target, path)) return "nested"

    return null
}

function getChangedProperty(target, path, style)
{
    if (style === "flat") return target[path]

    return getNestedProperty(target, path)
}

function setChangedProperty(target, path, value, style)
{
    if (style === "flat") {
        target[path] = value
        return
    }

    setNestedProperty(target, path, value)
}

function getNestedProperty(target, path)
{
    return path.split(".").reduce((value, part) => value?.[part], target)
}

function setNestedProperty(target, path, value)
{
    const parts = path.split(".")
    const last = parts.pop()
    let current = target

    for (const part of parts) {
        current[part] ??= {}
        current = current[part]
    }

    current[last] = value
}

function hasNestedProperty(target, path)
{
    let current = target

    for (const part of path.split(".")) {
        if (
            current == null ||
            typeof current !== "object" ||
            !hasOwnProperty(current, part)
        ) {
            return false
        }

        current = current[part]
    }

    return true
}

function hasOwnProperty(target, key)
{
    return Object.prototype.hasOwnProperty.call(target, key)
}
