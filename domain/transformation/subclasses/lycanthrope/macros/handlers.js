import {
    LYCANTHROPE_FERAL_HYBRID_EFFECT_DESCRIPTION,
    LYCANTHROPE_FERAL_HYBRID_EFFECT_DURATION_SECONDS,
    LYCANTHROPE_FERAL_HYBRID_EFFECT_NAME,
    LYCANTHROPE_HYBRID_FORM_ACTIVITY_IDS,
    LYCANTHROPE_HYBRID_FORM_ITEM_UUIDS,
    LYCANTHROPE_KINDRED_FORM_ACTIVITY_PREFIX,
    LYCANTHROPE_TRANSFORM_ACTIVITY_NAME,
    LYCANTHROPE_ULTIMATE_PREDATOR_EFFECT_NAME
} from "../constants.js"
import { activityMatchesName } from "../../../../../utils/activityNames.js"

// DAE item macro triggers that must not force a transformation (effect removal / repeats).
const IGNORED_DAE_TRIGGERS = Object.freeze(["off", "each", "startEveryTurn", "endEveryTurn"])

export function createLycanthropeMacroHandlers({
    activeEffectRepository = null,
    itemRepository,
    useActivityAsUser = null,
    getGame = () => globalThis.game,
    tracker,
    logger
})
{
    logger.debug("createLycanthropeMacroHandlers", {
        activeEffectRepository,
        itemRepository,
        useActivityAsUser,
        tracker
    })

    return Object.freeze({
        whenIdle: tracker.whenIdle,

        /**
         * Forces the feral hybrid form (Lust for the Hunt / Ultimate Predator).
         * Called by the bloodied trigger (trigger "bloodied") and by the Ultimate Predator
         * DAE item macro (trigger "on"/"off").
         */
        async triggerBloodiedHybridTransform({ actor, trigger, triggeringUserId = null })
        {
            logger.debug(
                "createLycanthropeMacroHandlers.triggerBloodiedHybridTransform",
                { actor, trigger, triggeringUserId }
            )

            return tracker.track(
                (async () =>
                {
                    if (!actor) return false
                    if (IGNORED_DAE_TRIGGERS.includes(trigger)) return false

                    // The Ultimate Predator effect only exists to fire this macro once;
                    // remove it first so it is not copied onto the transformed actor.
                    if (trigger === "on") {
                        await removeEffectsByName(
                            actor,
                            LYCANTHROPE_ULTIMATE_PREDATOR_EFFECT_NAME
                        )
                    }

                    const alreadyHybrid = isInHybridForm(actor)
                    let transformActivity = null

                    if (!alreadyHybrid) {
                        const hybridFormItem = findHybridFormItem(actor)
                        if (!hybridFormItem) {
                            logger.warn(
                                "No lycanthrope hybrid form item found on actor",
                                actor
                            )
                            return false
                        }

                        const activities = findHybridFormActivities(hybridFormItem)
                        transformActivity = activities.transformActivity

                        if (typeof transformActivity?.use !== "function") {
                            logger.warn(
                                "Lycanthrope hybrid form item is missing Transform activity",
                                hybridFormItem
                            )
                            return false
                        }

                        // Apply the hybrid stats, attacks and hybridForm flag before the
                        // token swap so they are kept by the transformation ("effects: all").
                        if (typeof activities.effectActivity?.use === "function") {
                            await useActivity(activities.effectActivity, actor, triggeringUserId)
                        }
                        else {
                            logger.warn(
                                "Lycanthrope hybrid form item is missing its hybrid effect activity",
                                hybridFormItem
                            )
                        }
                    }

                    await applyFeralMarker(actor)

                    if (transformActivity) {
                        await useActivity(transformActivity, actor, triggeringUserId)
                    }

                    return true
                })()
            )
        }
    })

    /**
     * Uses an activity on the lycanthrope player's client when this handler runs elsewhere
     * (e.g. on the GM after socket routing), so its usage/transform dialogs reach that player.
     * Falls back to a local use when no router is wired or no other active owner is found,
     * and keeps transform activities local when that player may not transform (dnd5e
     * "allowPolymorphing" off or no ACTOR_CREATE permission), as dnd5e would refuse them there.
     */
    async function useActivity(activity, actor, triggeringUserId)
    {
        logger.debug("createLycanthropeMacroHandlers.useActivity", {
            activity,
            actor,
            triggeringUserId
        })
        const userId = resolveActivityUserId(actor, triggeringUserId, activity)

        if (userId && typeof useActivityAsUser === "function" && activity?.uuid) {
            return useActivityAsUser({
                activityUuid: activity.uuid,
                actorUuid: actor?.uuid ?? null,
                userId
            })
        }

        return activity.use({ actor })
    }

    function resolveActivityUserId(actor, triggeringUserId, activity = null)
    {
        logger.debug("createLycanthropeMacroHandlers.resolveActivityUserId", {
            actor,
            triggeringUserId,
            activity
        })
        const game = getGame?.()
        const users = game?.users
        if (!users || typeof actor?.testUserPermission !== "function") return null

        const isActiveOwner = user =>
            Boolean(user?.active) &&
            !user.isGM &&
            actor.testUserPermission(user, "OWNER")

        const triggeringUser = triggeringUserId ? users.get?.(triggeringUserId) : null
        const target = isActiveOwner(triggeringUser)
            ? triggeringUser
            : users.find?.(isActiveOwner) ?? null

        if (!target || target.id === game.user?.id) return null
        if (activity?.type === "transform" && !canUserTransform(game, target)) return null

        return target.id
    }

    function canUserTransform(game, user)
    {
        logger.debug("createLycanthropeMacroHandlers.canUserTransform", { user })
        let allowPolymorphing = false
        try {
            allowPolymorphing = Boolean(game?.settings?.get?.("dnd5e", "allowPolymorphing"))
        }
        catch {
            allowPolymorphing = false
        }

        return allowPolymorphing && user?.can?.("ACTOR_CREATE") === true
    }

    function findHybridFormItem(actor)
    {
        logger.debug("createLycanthropeMacroHandlers.findHybridFormItem", { actor })
        for (const uuid of LYCANTHROPE_HYBRID_FORM_ITEM_UUIDS) {
            const item = itemRepository.findEmbeddedByUuidFlag(actor, uuid)
            if (item) return item
        }

        return null
    }

    async function applyFeralMarker(actor)
    {
        logger.debug("createLycanthropeMacroHandlers.applyFeralMarker", { actor })
        if (!activeEffectRepository) return null
        if (activeEffectRepository.hasByName(actor, LYCANTHROPE_FERAL_HYBRID_EFFECT_NAME)) {
            return null
        }

        return activeEffectRepository.create({
            actor,
            name: LYCANTHROPE_FERAL_HYBRID_EFFECT_NAME,
            description: LYCANTHROPE_FERAL_HYBRID_EFFECT_DESCRIPTION,
            icon: findHybridFormItem(actor)?.img ?? null,
            duration: {
                seconds: LYCANTHROPE_FERAL_HYBRID_EFFECT_DURATION_SECONDS
            }
        })
    }

    async function removeEffectsByName(actor, name)
    {
        logger.debug("createLycanthropeMacroHandlers.removeEffectsByName", { actor, name })
        if (!activeEffectRepository) return

        const effectIds = activeEffectRepository.getIdsByName(actor, name)
        if (!effectIds.length) return

        await activeEffectRepository.removeByIds(actor, effectIds)
    }
}

export function isInHybridForm(actor)
{
    const hybridForm =
              actor?.flags?.transformations?.lycanthrope?.hybridForm ??
              actor?.getFlag?.("transformations", "lycanthrope.hybridForm") ??
              0

    return Number(hybridForm) === 1
}

/**
 * Resolves the transform (token swap) and hybrid effect activities of a hybrid form item.
 * Known pack items are matched by activity id; anything else falls back to the activity type.
 */
export function findHybridFormActivities(item)
{
    const activities = normalizeActivities(
        item?.system?.activities ?? item?.activities ?? []
    )
    const sourceUuid =
              item?.flags?.transformations?.sourceUuid ??
              item?.getFlag?.("transformations", "sourceUuid") ??
              item?._stats?.compendiumSource ??
              item?.uuid ??
              null
    const knownIds = LYCANTHROPE_HYBRID_FORM_ACTIVITY_IDS[sourceUuid] ?? null

    const byId = id => activities.find(activity =>
        (activity?.id ?? activity?._id) === id
    ) ?? null

    const transformActivity =
              (knownIds ? byId(knownIds.transform) : null) ??
              activities.find(activity =>
                  activityMatchesName(activity, LYCANTHROPE_TRANSFORM_ACTIVITY_NAME)
              ) ??
              activities.find(activity =>
                  activity?.type === "transform" &&
                  !String(activity?.name ?? "").startsWith(LYCANTHROPE_KINDRED_FORM_ACTIVITY_PREFIX)
              ) ??
              null

    const effectActivity =
              (knownIds ? byId(knownIds.effect) : null) ??
              activities.find(activity =>
                  activity !== transformActivity &&
                  activity?.type === "utility" &&
                  normalizeActivities(activity?.effects).length > 0
              ) ??
              null

    return { transformActivity, effectActivity }
}

function normalizeActivities(activities)
{
    if (!activities) return []

    if (Array.isArray(activities)) return activities

    if (Array.isArray(activities?.contents)) {
        return activities.contents
    }

    if (typeof activities?.find === "function") {
        const collected = []
        for (const activity of activities) {
            collected.push(activity)
        }
        return collected
    }

    if (typeof activities === "object") {
        return Object.values(activities).filter(activity =>
            activity && activity !== activities.contents
        )
    }

    return []
}
