// services/actions/save.js

import { resolveValue } from "../utils/resolveValue.js"
import { interpolate } from "../utils/interpolate.js";

const CHAT_MESSAGE_FLAVOR_TEMPLATE =
          "modules/transformations/scripts/templates/chatMessages/chat-message-flavor.hbs"

export const ROLL_SAVING_THROW_EVENT = "rollSavingThrow"

export function createSaveAction({
    tracker,
    getGame = () => globalThis.game,
    socketGateway = null,
    logger
})
{
    logger.debug("createSaveAction", {tracker, getGame, socketGateway})

    return async function SAVE_ACTION({
        actor,
        action,
        context,
        variables
    })
    {
        const {ability, dc, key, title, flavor} = action.data ?? {}

        if (!ability || !key) {
            logger.warn("SAVE action missing ability or key", action)
            return false
        }

        const resolvedDC = resolveValue(dc, context, variables)

        if (!Number.isFinite(resolvedDC)) {
            logger.warn("SAVE action has invalid DC", dc)
            return false
        }

        return tracker.track(
            (async () =>
            {
                const formattedFlavor = await getFormattedFlavor(actor, context, variables, flavor)

                const rolls = await executeSave(actor, {
                    targetUserId: resolveSaveUserId(actor, context, getGame()),
                    socketGateway,
                    logger
                }, {
                    roll: {
                        ability: ability,
                        target: resolvedDC
                    },
                    dialog: {
                        title: title ?? ""
                    },
                    message: {
                        create: true,
                        data: {
                            flavor: formattedFlavor
                        }
                    }
                })

                if (!rolls) return false

                const success = rolls[0]._total >= resolvedDC

                context.saves ??= {}
                context.saves[key] = {
                    ability,
                    dc: resolvedDC,
                    total: rolls[0]._total,
                    success
                }

                return true
            })()
        )
    }
}

// Saves belong to the player who owns the actor, not to the GM client that runs the trigger.
// Prefer the triggering user, then the player whose character this is, then any active owner.
export function resolveSaveUserId(actor, context, game)
{
    const users = game?.users
    if (!users || !actor) return null

    const isActivePlayerOwner = user =>
        Boolean(user) &&
        user.active === true &&
        user.isGM !== true &&
        actor.testUserPermission?.(user, "OWNER") === true

    const triggeringUser = users.get?.(context?.triggeringUserId)
    if (isActivePlayerOwner(triggeringUser)) return triggeringUser.id

    const characterUser = users.find?.(user =>
        user.character?.id === actor.id && isActivePlayerOwner(user)
    )
    if (characterUser) return characterUser.id

    return users.find?.(isActivePlayerOwner)?.id ?? null
}

export async function rollSavingThrowForSocket({actorUuid, roll, dialog, message} = {})
{
    const actor = actorUuid ? await fromUuid(actorUuid) : null
    if (!actor?.isOwner || typeof actor.rollSavingThrow !== "function") {
        return null
    }

    const rolls = await actor.rollSavingThrow(roll, dialog, message)
    return serializeRolls(rolls)
}

function serializeRolls(rolls)
{
    if (!Array.isArray(rolls) || rolls.length === 0) return null
    return rolls.map(entry => ({_total: entry?.total ?? entry?._total}))
}

async function executeSave(actor, {targetUserId, socketGateway, logger}, options)
{
    if (globalThis.__TRANSFORMATIONS_TEST__ === true) {
        const env = globalThis.___TransformationTestEnvironment___
        if (env && typeof env === "object") {
            env.saveRolled = true
            env.saveOptions = options
        }

        const result = globalThis.___TransformationTestEnvironment___?.saveResult

        if (result == null) return null

        return [{_total: result}]
    }

    if (
        targetUserId &&
        targetUserId !== globalThis.game?.user?.id &&
        socketGateway?.isReady?.() &&
        typeof socketGateway.executeAsUser === "function"
    ) {
        try {
            return await socketGateway.executeAsUser(ROLL_SAVING_THROW_EVENT, targetUserId, {
                actorUuid: actor.uuid,
                roll: options.roll,
                dialog: options.dialog,
                message: options.message
            })
        } catch (error) {
            logger.error("SAVE action routing failed, rolling locally", {targetUserId, error})
        }
    }

    if (typeof actor.rollSavingThrow !== "function") {
        return null
    }

    return actor.rollSavingThrow(options.roll, options.dialog, options.message)
}

async function getFormattedFlavor(actor, context, variables, {
    itemUuid,
    subtitle = "",
    body = ""
} = {})
{
    const {img = "", title = ""} = arguments[3] ?? {}

    if (!itemUuid && !img && !title && !subtitle && !body) {
        return ""
    }

    const item = itemUuid ? await fromUuid(itemUuid) : null

    const parsedBody = interpolate(body, {
        actor,
        transformation: context.transformation,
        variables
    })

    return foundry.applications.handlebars.renderTemplate(
        CHAT_MESSAGE_FLAVOR_TEMPLATE,
        {
            actorId: actor.id,
            itemId: item?.id ?? "",
            img: item?.img ?? img,
            title: item?.name ?? title,
            subtitle,
            body: parsedBody
        }
    )
}
