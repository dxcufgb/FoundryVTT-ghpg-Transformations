// services/actions/save.js

import { resolveValue } from "../utils/resolveValue.js"
import { interpolate } from "../utils/interpolate.js";

const CHAT_MESSAGE_FLAVOR_TEMPLATE =
          "modules/transformations/scripts/templates/chatMessages/chat-message-flavor.hbs"

export const ROLL_SAVING_THROW_EVENT = "rollSavingThrow"

export function createSaveAction({
    getGame,
    socketGateway,
    tracker,
    logger
})
{
    logger.debug("createSaveAction", {getGame, socketGateway, tracker})

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

                const rolls = await executeSave(actor, {getGame, socketGateway, logger}, {
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

async function executeSave(actor, {getGame, socketGateway, logger}, options)
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

    // Triggers such as bloodied run on the active GM, but the roll dialog belongs to the
    // player who owns the character, so hand the roll over to them when they are connected.
    const targetUser = resolveRollingUser(actor, getGame?.())

    if (
        targetUser &&
        targetUser.id !== getGame?.()?.user?.id &&
        socketGateway?.isReady?.() &&
        actor.uuid
    )
    {
        try {
            const rolls = await socketGateway.executeAsUser(
                ROLL_SAVING_THROW_EVENT,
                targetUser.id,
                {
                    actorUuid: actor.uuid,
                    options
                }
            )
            if (Array.isArray(rolls)) return rolls.length ? rolls : null
            if (rolls === null) return null
            logger.warn("Routed saving throw returned no result, rolling locally", {
                actor,
                userId: targetUser.id
            })
        } catch (error) {
            logger.error("Routing saving throw to owning user failed, rolling locally", {
                actor,
                userId: targetUser.id,
                error
            })
        }
    }

    return rollSavingThrowLocally(actor, options)
}

export async function handleRoutedSavingThrow(payload = {})
{
    const actor = payload?.actorUuid
        ? await fromUuid(payload.actorUuid).catch(() => null)
        : null

    if (!actor) return null

    return rollSavingThrowLocally(actor, payload.options ?? {})
}

async function rollSavingThrowLocally(actor, options)
{
    if (typeof actor.rollSavingThrow !== "function") {
        return null
    }

    const rolls = await actor.rollSavingThrow(options.roll, options.dialog, options.message)

    if (!Array.isArray(rolls) || !rolls.length) return null

    // Only the totals are needed by the caller, and they have to survive the socket round trip.
    return rolls.map(roll => ({_total: roll?.total ?? roll?._total}))
}

function resolveRollingUser(actor, game)
{
    const users = Array.from(game?.users ?? [])
    const owners = users.filter(user =>
        user?.active &&
        !user.isGM &&
        actor.testUserPermission?.(user, "OWNER")
    )

    if (!owners.length) return null

    return owners.find(user => user.character?.id === actor.id) ?? owners[0]
}

async function getFormattedFlavor(actor, context, variables, {
    itemUuid,
    itemName,
    subtitle = "",
    body = ""
} = {})
{
    const {img = "", title = ""} = arguments[3] ?? {}

    if (!itemUuid && !itemName && !img && !title && !subtitle && !body) {
        return ""
    }

    // Prefer the actor's own copy of the feature so the card shows the icon the player sees
    // on their sheet, and fall back to the compendium item.
    const ownedItem = itemName
        ? actor.items?.find(candidate => candidate.name === itemName) ?? null
        : null
    const item = ownedItem ?? (itemUuid ? await fromUuid(itemUuid).catch(() => null) : null)

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
