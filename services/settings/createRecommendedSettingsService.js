export const MIDI_MODULE_ID = "midi-qol"
export const MIDI_AUTO_ITEM_EFFECTS_VALUE = "applyNoButton"
export const PLAYER_SUMMONING_PERMISSIONS = Object.freeze(["ACTOR_CREATE", "TOKEN_CREATE"])

/**
 * Reads and applies the world settings the GM welcome message recommends:
 *  - Midi-QOL "Auto apply item effects" = "apply effects and don't show button"
 *  - players may create actors and tokens (user permissions) and dnd5e "Allow summoning" is on
 */
export function createRecommendedSettingsService({
    getGame,
    getConst = () => globalThis.CONST,
    logger
})
{
    logger.debug("createRecommendedSettingsService", { getGame, getConst })

    function canModifySettings()
    {
        return getGame().user?.can?.("SETTINGS_MODIFY") === true
    }

    function isMidiActive()
    {
        return getGame().modules?.get(MIDI_MODULE_ID)?.active === true
    }

    function playerRoles()
    {
        const { PLAYER, GAMEMASTER } = getConst().USER_ROLES
        return Array.from({ length: GAMEMASTER - PLAYER + 1 }, (_, index) => PLAYER + index)
    }

    function readMidiValue()
    {
        return getGame().settings.get(MIDI_MODULE_ID, "ConfigSettings")?.autoItemEffects ?? null
    }

    function readPermissions()
    {
        return getGame().settings.get("core", "permissions") ?? {}
    }

    function playersMayCreate(permissions, permission)
    {
        const { PLAYER } = getConst().USER_ROLES
        return (permissions[permission] ?? []).includes(PLAYER)
    }

    /**
     * What is already set, and whether this user is allowed to change it.
     */
    function getStatus()
    {
        logger.debug("createRecommendedSettingsService.getStatus", {})
        const game = getGame()
        const permissions = readPermissions()
        const allowSummoning = game.settings.get("dnd5e", "allowSummoning") === true
        const actorCreate = playersMayCreate(permissions, "ACTOR_CREATE")
        const tokenCreate = playersMayCreate(permissions, "TOKEN_CREATE")

        return {
            canModify: canModifySettings(),
            midi: {
                available: isMidiActive(),
                current: isMidiActive() ? readMidiValue() : null,
                applied: isMidiActive() && readMidiValue() === MIDI_AUTO_ITEM_EFFECTS_VALUE
            },
            summoning: {
                allowSummoning,
                actorCreate,
                tokenCreate,
                applied: allowSummoning && actorCreate && tokenCreate
            }
        }
    }

    function refuse(reason)
    {
        return { ok: false, changed: false, reason }
    }

    async function applyMidiAutoItemEffects()
    {
        logger.debug("createRecommendedSettingsService.applyMidiAutoItemEffects", {})
        if (!canModifySettings()) return refuse("not-allowed")
        if (!isMidiActive()) return refuse("midi-inactive")
        if (readMidiValue() === MIDI_AUTO_ITEM_EFFECTS_VALUE) {
            return { ok: true, changed: false, reason: "already-applied" }
        }

        // Midi keeps all of its workflow options in one object setting; change only this key.
        const current = getGame().settings.get(MIDI_MODULE_ID, "ConfigSettings") ?? {}
        await getGame().settings.set(MIDI_MODULE_ID, "ConfigSettings", {
            ...current,
            autoItemEffects: MIDI_AUTO_ITEM_EFFECTS_VALUE
        })
        return { ok: true, changed: true }
    }

    async function applyPlayerSummoning()
    {
        logger.debug("createRecommendedSettingsService.applyPlayerSummoning", {})
        if (!canModifySettings()) return refuse("not-allowed")

        const status = getStatus().summoning
        if (status.applied) return { ok: true, changed: false, reason: "already-applied" }

        const game = getGame()
        if (!status.actorCreate || !status.tokenCreate) {
            // Write the whole permissions object back: the setting stores every permission.
            const permissions = JSON.parse(JSON.stringify(readPermissions()))
            for (const permission of PLAYER_SUMMONING_PERMISSIONS) {
                permissions[permission] = [...new Set([...(permissions[permission] ?? []), ...playerRoles()])]
                    .sort((left, right) => left - right)
            }
            await game.settings.set("core", "permissions", permissions)
        }

        if (!status.allowSummoning) {
            await game.settings.set("dnd5e", "allowSummoning", true)
        }
        return { ok: true, changed: true }
    }

    /* ---------- fallbacks: open the menu where the setting lives ---------- */

    function openMenu(menuKey)
    {
        const menu = getGame().settings.menus?.get(menuKey)
        if (!menu?.type) {
            logger.warn("Settings menu not found", menuKey)
            return false
        }
        new menu.type().render({ force: true })
        return true
    }

    function openMidiSettings()
    {
        return openMenu(`${MIDI_MODULE_ID}.midi-qol`)
    }

    function openPermissionSettings()
    {
        return openMenu("core.permissions")
    }

    function openGameSettings()
    {
        new foundry.applications.settings.SettingsConfig().render({ force: true })
        return true
    }

    return Object.freeze({
        getStatus,
        applyMidiAutoItemEffects,
        applyPlayerSummoning,
        openMidiSettings,
        openPermissionSettings,
        openGameSettings
    })
}
