export const GM_WELCOME_CARD_FLAG = "gmWelcomeCard"

export const GM_WELCOME_ACTIONS = Object.freeze({
    APPLY_MIDI: "apply-midi",
    OPEN_MIDI: "open-midi",
    APPLY_SUMMONING: "apply-summoning",
    OPEN_PERMISSIONS: "open-permissions",
    OPEN_SETTINGS: "open-settings"
})

/** Read-only status buttons shown next to the buttons that open a settings menu. */
export const GM_WELCOME_STATUSES = Object.freeze({
    PERMISSIONS: "permissions",
    SUMMONING_SETTING: "summoning-setting"
})

export const STATUS_APPLIED_CLASS = "transformations-status-applied"
export const STATUS_NOT_APPLIED_CLASS = "transformations-status-not-applied"

const CARD_SELECTOR = "[data-transformations-welcome]"
const BUTTON_SELECTOR = "[data-transformations-welcome-action]"

export function buildGmWelcomeCardContent()
{
    const action = name => `data-transformations-welcome-action="${name}"`
    const status = name => `data-transformations-welcome-status="${name}"`
    const row = "display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px;"

    return `
<div data-transformations-welcome>
<h3>Welcome to Transformations!</h3>
<p>Greetings, GM! For the best experience the following settings should be considered and applied:</p>
<ol>
    <li>
        In Settings &rarr; MidiQOL &rarr; Workflow, set the setting
        "Auto apply item effects" to "apply effects and don't show button".
        <div style="${row}">
            <button type="button" ${action(GM_WELCOME_ACTIONS.APPLY_MIDI)}>Apply this setting</button>
            <button type="button" ${action(GM_WELCOME_ACTIONS.OPEN_MIDI)}>Open Midi-QOL settings</button>
        </div>
    </li>
    <br>
    <li>
        If you want players to be able to place summons themselves, they need
        the user permissions to create both actors and tokens. The dnd5e
        setting "Allow summoning" also needs to be active.
        <div style="${row}">
            <button type="button" ${action(GM_WELCOME_ACTIONS.APPLY_SUMMONING)}>Allow players to summon</button>
        </div>
        <div style="${row}">
            <button type="button" ${action(GM_WELCOME_ACTIONS.OPEN_PERMISSIONS)}>Open user permissions</button>
            <button type="button" disabled ${status(GM_WELCOME_STATUSES.PERMISSIONS)}></button>
        </div>
        <div style="${row}">
            <button type="button" ${action(GM_WELCOME_ACTIONS.OPEN_SETTINGS)}>Open game settings</button>
            <button type="button" disabled ${status(GM_WELCOME_STATUSES.SUMMONING_SETTING)}></button>
        </div>
    </li>
</ol>
<p>Thank you for installing the Transformations module!</p>
</div>
`
}

/**
 * Wires up the buttons on the GM welcome message and keeps their labels and colours in sync
 * with the current settings: green when applied, red when not.
 */
export function bindGmWelcomeCard({
    message,
    html,
    settingsService,
    notifier,
    logger
})
{
    if (message?.flags?.transformations?.[GM_WELCOME_CARD_FLAG] !== true) return

    const root = resolveHtmlRoot(html)
    const card = root?.matches?.(CARD_SELECTOR) ? root : root?.querySelector?.(CARD_SELECTOR)
    if (!card) return

    const button = action => card.querySelector(`[data-transformations-welcome-action="${action}"]`)
    const statusButton = name => card.querySelector(`[data-transformations-welcome-status="${name}"]`)

    function refresh()
    {
        const status = settingsService.getStatus()
        const cannotModify = status.canModify ? null : "You need permission to modify settings"

        setState(button(GM_WELCOME_ACTIONS.APPLY_MIDI), {
            applied: status.midi.applied,
            appliedLabel: "✓ Applied",
            notAppliedLabel: "✗ Not applied - click to apply",
            blockedReason: !status.midi.available ? "Midi-QOL is not active" : cannotModify
        })
        setState(button(GM_WELCOME_ACTIONS.APPLY_SUMMONING), {
            applied: status.summoning.applied,
            appliedLabel: "✓ Applied",
            notAppliedLabel: "✗ Not applied - click to apply",
            blockedReason: cannotModify
        })

        // One status per settings menu button: the permissions and the dnd5e setting are separate.
        const missingPermissions = [
            !status.summoning.actorCreate ? "actors" : null,
            !status.summoning.tokenCreate ? "tokens" : null
        ].filter(Boolean)
        setStatus(statusButton(GM_WELCOME_STATUSES.PERMISSIONS), {
            applied: missingPermissions.length === 0,
            appliedLabel: "✓ Players can create actors and tokens",
            notAppliedLabel: `✗ Players can't create ${missingPermissions.join(" or ")}`
        })
        setStatus(statusButton(GM_WELCOME_STATUSES.SUMMONING_SETTING), {
            applied: status.summoning.allowSummoning,
            appliedLabel: "✓ Allow summoning is on",
            notAppliedLabel: "✗ Allow summoning is off"
        })
    }

    // The card is re-rendered with the chat log; only attach the listener once per element.
    if (card.dataset.bound !== "true") {
        card.dataset.bound = "true"
        card.addEventListener("click", async event =>
        {
            const target = event.target.closest?.(BUTTON_SELECTOR)
            if (!target || target.disabled) return

            event.preventDefault()
            event.stopPropagation()

            try {
                await handleAction(target.dataset.transformationsWelcomeAction)
            } catch (error) {
                logger.error("GM welcome card action failed", error)
                notifier.error("Applying the setting failed. See the console for details.")
            }
            refresh()
        })
    }

    async function handleAction(action)
    {
        switch (action) {
            case GM_WELCOME_ACTIONS.APPLY_MIDI:
                return report(await settingsService.applyMidiAutoItemEffects(), {
                    done: "Midi-QOL: \"Auto apply item effects\" is now \"apply effects and don't show button\".",
                    already: "Midi-QOL: \"Auto apply item effects\" was already set."
                })
            case GM_WELCOME_ACTIONS.APPLY_SUMMONING:
                return report(await settingsService.applyPlayerSummoning(), {
                    done: "Players can now create actors and tokens, and \"Allow summoning\" is on.",
                    already: "Players could already summon."
                })
            case GM_WELCOME_ACTIONS.OPEN_MIDI:
                return settingsService.openMidiSettings()
            case GM_WELCOME_ACTIONS.OPEN_PERMISSIONS:
                return settingsService.openPermissionSettings()
            case GM_WELCOME_ACTIONS.OPEN_SETTINGS:
                return settingsService.openGameSettings()
            default:
                logger.warn("Unknown GM welcome card action", action)
        }
    }

    function report(result, messages)
    {
        if (!result.ok) {
            notifier.warn(
                result.reason === "midi-inactive"
                    ? "Midi-QOL is not active, so its setting can't be applied."
                    : "You don't have permission to modify settings. Use the buttons that open the settings menus instead."
            )
            return
        }
        notifier.info(result.changed ? messages.done : messages.already)
    }

    refresh()
}

export function registerGmWelcomeCard({
    settingsService,
    notifier,
    logger
})
{
    logger.debug("registerGmWelcomeCard", { settingsService, notifier })

    Hooks.on("renderChatMessageHTML", (message, html) =>
    {
        bindGmWelcomeCard({ message, html, settingsService, notifier, logger })
    })
}

function markStatus(button, applied)
{
    button.classList.toggle(STATUS_APPLIED_CLASS, applied)
    button.classList.toggle(STATUS_NOT_APPLIED_CLASS, !applied)
}

/** A button that applies a setting: green once applied, red while it is not. */
function setState(button, { applied, appliedLabel, notAppliedLabel, blockedReason })
{
    if (!button) return

    markStatus(button, applied)
    if (applied) {
        button.textContent = appliedLabel
        button.disabled = true
        button.title = "Already applied"
        return
    }

    button.textContent = notAppliedLabel
    button.disabled = Boolean(blockedReason)
    button.title = blockedReason ?? ""
}

/** A read-only status shown next to a button that only opens a settings menu. */
function setStatus(button, { applied, appliedLabel, notAppliedLabel })
{
    if (!button) return

    markStatus(button, applied)
    button.textContent = applied ? appliedLabel : notAppliedLabel
}

function resolveHtmlRoot(html)
{
    if (!html) return null
    if (typeof html.querySelector === "function") return html
    if (typeof html[0]?.querySelector === "function") return html[0]
    return null
}
