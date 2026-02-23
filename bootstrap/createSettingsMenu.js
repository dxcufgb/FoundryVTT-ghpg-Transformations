export function createSettingsMenu({
    MODULE_ID,
    game,
    TransformationsDebugApplication
})
{
    if (MODULE_ID === undefined) throw Error("MODULE_ID must be a string")

    game.settings.register(MODULE_ID, "loggerLevel", {
        name: "Logger Level",
        hint: "Set the logging verbosity for Transformations module.",
        scope: "world",
        config: true,
        type: String,
        choices: {
            none: "None",
            error: "Error",
            warn: "Warning",
            info: "Info",
            debug: "Debug"
        },
        default: "Error"
    })

    game.settings.registerMenu(MODULE_ID, "debugMenu", {
        name: "Transformation Debug Menu",
        label: "Open Debug Menu",
        hint: "Manually test transformation rolltables effects.",
        icon: "fas fa-bug",
        type: TransformationsDebugApplication,
        restricted: true
    })
}