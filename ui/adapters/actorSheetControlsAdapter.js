export function registerActorSheetControlsAdapter({
    game,
    ActorClass,
    transformationService,
    transformationQueryService,
    debouncedTracker,
    moduleUi,
    logger,
})
{
    logger.debug("registerActorSheetControlsAdapter", {
        game,
        ActorClass,
        transformationService,
        transformationQueryService,
        debouncedTracker,
        moduleUi
    })

    Hooks.on("getHeaderControlsApplicationV2", (app, controls) =>
    {
        logger.debug("registerActorSheetControlsAdapter.getHeaderControlsApplicationV2", { app, controls })
        debouncedTracker.pulse("getHeaderControlsApplicationV2")
        addChangeTransformationControlIfAllowed({
            app,
            controls,
            game,
            ActorClass,
            transformationQueryService,
            moduleUi,
            logger
        })
        addDowngradeControlIfAllowed({
            app,
            controls,
            game,
            ActorClass,
            transformationService,
            logger
        })
    })
}

export function canUseChangeTransformationControl({
    app,
    game,
    ActorClass
})
{
    if (!isActorSheetApplication({app, ActorClass})) return false

    return isChangeTransformationAllowedForUser({game})
}

export function isChangeTransformationAllowedForUser({game})
{
    return isUserAllowedByMinimumRoleSetting({
        game,
        settingKey: "changeTransformationAllowedRoles"
    })
}

export function canUseDowngradeTransformationControl({
    app,
    game,
    ActorClass,
    minimumStage = 1
})
{
    if (!isActorSheetApplication({app, ActorClass})) return false
    if (!isDowngradeTransformationAllowedForUser({game})) return false

    const actor = app.actor
    const transformationId = actor.getFlag?.("transformations", "type") ??
        actor.flags?.transformations?.type ??
        null
    const stage = Number(
        actor.getFlag?.("transformations", "stage") ??
        actor.flags?.transformations?.stage ??
        0
    )

    return Boolean(transformationId) &&
        Number.isFinite(stage) &&
        stage > minimumStage
}

export function isDowngradeTransformationAllowedForUser({game})
{
    return isUserAllowedByMinimumRoleSetting({
        game,
        settingKey: "downgradeTransformationAllowedRoles"
    })
}

function isUserAllowedByMinimumRoleSetting({
    game,
    settingKey
})
{
    const user = game?.user
    if (!user) return false

    const userRole = Number(user.role)
    if (!Number.isFinite(userRole)) return false
    if (userRole >= getFullGMRole()) return true

    let settingValue = null
    try {
        settingValue = game.settings?.get?.(
            "transformations",
            settingKey
        )
    } catch (err) {
        return false
    }

    const minimumRole = parseDowngradeMinimumRole(settingValue)

    return userRole >= minimumRole
}

export function parseDowngradeMinimumRole(value)
{
    if (typeof value === "number") {
        return normalizeRoleValue(value)
    }

    if (typeof value !== "string") {
        return getDefaultDowngradeMinimumRole()
    }

    return normalizeRoleValue(Number(value.trim()))
}

function normalizeRoleValue(value)
{
    return Number.isFinite(value) && value >= 1
        ? value
        : getDefaultDowngradeMinimumRole()
}

function getDefaultDowngradeMinimumRole()
{
    return getFullGMRole()
}

function getFullGMRole()
{
    return globalThis.CONST?.USER_ROLES?.GAMEMASTER ?? 4
}

function addChangeTransformationControlIfAllowed({
    app,
    controls,
    game,
    ActorClass,
    transformationQueryService,
    moduleUi,
    logger
})
{
    if (!canUseChangeTransformationControl({
        app,
        game,
        ActorClass
    })) {
        return
    }

    controls.push({
        action: "transformation-GM-config",
        name: "Change Transformation",
        label: "Change Transformation",
        icon: "fas fa-dna",
        onClick: async () =>
        {
            logger.debug("Transformations menu clicked")

            try {
                const transformations =
                          await transformationQueryService.getAll()
                await moduleUi.dialogs.openTransformationConfig({
                    actor: app.actor,
                    transformations,
                    triggeringUserId: game.user?.id ?? null
                })
            } catch (err) {
                logger.error(
                    "Failed to open TransformationConfig",
                    err
                )
            }
        }
    })
}

function addDowngradeControlIfAllowed({
    app,
    controls,
    game,
    ActorClass,
    transformationService,
    logger
})
{
    if (!canUseDowngradeTransformationControl({
        app,
        game,
        ActorClass
    })) {
        return
    }

    controls.push({
        action: "transformation-downgrade-stage",
        name: "Downgrade Transformation Stage",
        label: "Downgrade Transformation Stage",
        icon: "fas fa-level-down-alt",
        onClick: async () =>
        {
            logger.debug("Downgrade Transformation Stage clicked")
            try {
                const result =
                    await transformationService.downgradeTransformationStage(
                        app.actor,
                        {
                            triggeringUserId: game.user?.id ?? null
                        }
                    )

                if (result?.ok !== false) {
                    await rerenderActorSheet(app, logger)
                }
            } catch (err) {
                logger.error(
                    "Failed to downgrade transformation stage",
                    err
                )
            }
        }
    })
}

export async function rerenderActorSheet(app, logger = null)
{
    if (typeof app?.render !== "function") return false

    try {
        await app.render(true)
        return true
    } catch (err) {
        logger?.error?.(
            "Failed to rerender actor sheet after transformation downgrade",
            err
        )
        return false
    }
}

function isActorSheetApplication({app, ActorClass})
{
    if (!(app.document instanceof ActorClass)) return false
    if (!app.actor) return false
    if (app.actor.type !== "character") return false

    return true
}
