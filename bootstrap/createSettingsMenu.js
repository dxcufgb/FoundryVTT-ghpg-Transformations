export function createSettingsMenu({
    MODULE_ID,
    game,
    TransformationsDebugApplication
})
{
    if (MODULE_ID === undefined) throw Error("MODULE_ID must be a string")
    const canConfigureSettings = isFullGM(game?.user)

    game.settings.register(MODULE_ID, "loggerLevel", {
        name: "Logger Level",
        hint: "Set the logging verbosity for Transformations module.",
        scope: "world",
        config: canConfigureSettings,
        restricted: true,
        type: String,
        choices: {
            none: "None",
            error: "Error",
            warn: "Warning",
            info: "Info",
            debug: "Debug"
        },
        default: "Warning"
    })

    game.settings.register(MODULE_ID, "downgradeTransformationAllowedRoles", {
        name: "Downgrade Transformation Allowed Roles",
        hint: "Players with selected or higher can downgrade their transformation",
        scope: "world",
        config: canConfigureSettings,
        restricted: true,
        type: Number,
        choices: {
            [roleValue("GAMEMASTER", 4)]: "GM",
            [roleValue("ASSISTANT", 3)]: "Assisting GM",
            [roleValue("TRUSTED", 2)]: "Trusted Player",
            [roleValue("PLAYER", 1)]: "Player"
        },
        default: roleValue("GAMEMASTER", 4)
    })

    game.settings.register(MODULE_ID, "changeTransformationAllowedRoles", {
        name: "Change Transformation Allowed Roles",
        hint: "Players with selected or higher can change their transformation",
        scope: "world",
        config: canConfigureSettings,
        restricted: true,
        type: Number,
        choices: {
            [roleValue("GAMEMASTER", 4)]: "GM",
            [roleValue("ASSISTANT", 3)]: "Assisting GM",
            [roleValue("TRUSTED", 2)]: "Trusted Player",
            [roleValue("PLAYER", 1)]: "Player"
        },
        default: roleValue("GAMEMASTER", 4)
    })

    if (canConfigureSettings) {
        game.settings.registerMenu(MODULE_ID, "debugMenu", {
            name: "Transformation Debug Menu",
            label: "Open Debug Menu",
            hint: "Manually test transformation rolltables effects.",
            icon: "fas fa-bug",
            type: TransformationsDebugApplication,
            restricted: true
        })
    }
}

function roleValue(key, fallback)
{
    return globalThis.CONST?.USER_ROLES?.[key] ?? fallback
}

function isFullGM(user)
{
    return Number(user?.role) >= roleValue("GAMEMASTER", 4)
}
