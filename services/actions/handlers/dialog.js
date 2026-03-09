// services/actions/dialog.js

export function createDialogAction({
    getGame,
    tracker,
    logger
})
{
    logger.debug("createDialogAction", {
        getGame,
        tracker
    })

    return async function DIALOG_ACTION({
        actor,
        action,
        context
    })
    {
        const dialogFactory = getGame().transformations.getDialogFactory()
        logger.debug("createDialogAction.DIALOG_ACTION", {
            actor,
            action,
            context
        })

        const { dialogFactoryFunction, ...data } = action.data ?? {}

        if (!dialogFactoryFunction) {
            logger.warn(
                "DIALOG action missing dialogFactoryFunction",
                action
            )
            return
        }

        if (!actor) {
            logger.warn("DIALOG action missing actor", action)
            return
        }

        const factoryMethod = dialogFactory?.[dialogFactoryFunction]

        if (typeof factoryMethod !== "function") {
            logger.warn(
                "DIALOG action unknown dialogFactory function",
                dialogFactoryFunction
            )
            return
        }

        return tracker.track(
            (async () =>
            {
                logger.debug(
                    "Executing DIALOG action",
                    actor.id,
                    dialogFactoryFunction
                )

                const result = await factoryMethod.call(
                    dialogFactory,
                    {
                        actor,
                        ...(data ?? {})
                    }
                )

                if (data.key) {
                    context.transformation = {
                        dialogChoices: {
                            [data.key]: result
                        }
                    }
                }
                logger.debug(
                    "DIALOG action result",
                    dialogFactoryFunction,
                    result
                )

                return true
            })()
        )
    }
}
