// services/actions/save.js

import { resolveValue } from "../utils/resolveValue.js"
import { interpolate } from "../utils/interpolate.js";

const CHAT_MESSAGE_FLAVOR_TEMPLATE =
          "modules/transformations/scripts/templates/chatMessages/chat-message-flavor.hbs"

export function createSaveAction({
    tracker,
    logger
})
{
    logger.debug("createSaveAction", {tracker})

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

// 👇 Production default (unchanged behavior)
async function executeSave(actor, options)
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
