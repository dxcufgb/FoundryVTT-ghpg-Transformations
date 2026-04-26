import { waitFor } from "./waitFor.js"
import { waitForNextFrame } from "./dom.js"

const ROLL_CONFIGURATION_DIALOG_SELECTOR =
    "dialog.application.roll-configuration"
const FOLLOW_UP_ROLL_BUTTON_TIMEOUT = 750

function normalizeText(value)
{
    return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
}

function matchesExpectedText(actualText, expectedText)
{
    if (expectedText == null) {
        return true
    }

    const normalizedActualText = normalizeText(actualText)

    if (expectedText instanceof RegExp) {
        return new RegExp(expectedText.source, expectedText.flags).test(
            normalizedActualText
        )
    }

    return normalizedActualText === normalizeText(expectedText)
}

function describeExpectedText(expectedText)
{
    if (expectedText == null) {
        return null
    }

    if (expectedText instanceof RegExp) {
        return `/${expectedText.source}/${expectedText.flags}`
    }

    return `"${normalizeText(expectedText)}"`
}

function describeDialogMatch({
    title = null,
    subtitle = null
} = {})
{
    const parts = []

    if (title != null) {
        parts.push(`title ${describeExpectedText(title)}`)
    }

    if (subtitle != null) {
        parts.push(`subtitle ${describeExpectedText(subtitle)}`)
    }

    return parts.length > 0
        ? ` with ${parts.join(" and ")}`
        : ""
}

function getRollConfigurationDialogTitle(dialog)
{
    return normalizeText(
        dialog?.querySelector(".window-title")?.textContent
    )
}

function getRollConfigurationDialogSubtitle(dialog)
{
    return normalizeText(
        dialog?.querySelector(".window-subtitle")?.textContent
    )
}

function matchesRollConfigurationDialog(dialog, {
    title = null,
    subtitle = null,
    predicate = null
} = {})
{
    if (!(dialog instanceof HTMLDialogElement)) {
        return false
    }

    if (!matchesExpectedText(getRollConfigurationDialogTitle(dialog), title)) {
        return false
    }

    if (
        subtitle != null &&
        !matchesExpectedText(
            getRollConfigurationDialogSubtitle(dialog),
            subtitle
        )
    ) {
        return false
    }

    return typeof predicate === "function"
        ? Boolean(predicate(dialog))
        : true
}

function findRollConfigurationDialog(options = {})
{
    const matchingDialogs = Array.from(
        document.querySelectorAll(ROLL_CONFIGURATION_DIALOG_SELECTOR)
    ).filter(dialog => matchesRollConfigurationDialog(dialog, options))

    return matchingDialogs.at(-1) ?? null
}

function findDialogButton(dialog, action)
{
    const buttonNav = dialog?.querySelector("nav.dialog-buttons")

    if (!buttonNav) {
        return {
            buttonNav: null,
            button: null
        }
    }

    return {
        buttonNav,
        button:
            Array.from(buttonNav.querySelectorAll("button[data-action]")).find(
                button => button.dataset?.action === action
            ) ?? null
    }
}

function findDialogButtonByText(dialog, text)
{
    const buttonNav = dialog?.querySelector("nav.dialog-buttons")

    if (!buttonNav) {
        return null
    }

    return Array.from(buttonNav.querySelectorAll("button")).find(button =>
        normalizeText(button.textContent) === normalizeText(text)
    ) ?? null
}

function triggerButtonInteraction(button)
{
    const form = button?.closest?.("form")
    const isSubmitButton =
        button instanceof HTMLButtonElement &&
        button.type === "submit"

    if (form && isSubmitButton && typeof form.requestSubmit === "function") {
        const clickEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true
        })
        const clickWasCancelled = button.dispatchEvent(clickEvent) === false ||
            clickEvent.defaultPrevented

        if (!clickWasCancelled) {
            form.requestSubmit(button)
        }
        return
    }

    button?.click?.()
}

export async function waitForRollConfigurationDialog({
    title = null,
    subtitle = null,
    timeout = 3000,
    predicate = null
} = {})
{
    return waitFor({
        timeout,
        predicate: () =>
            findRollConfigurationDialog({
                title,
                subtitle,
                predicate
            }),
        errorMessage:
            `Timed out waiting for roll-configuration dialog${describeDialogMatch({
                title,
                subtitle
            })}`
    })
}

export async function waitForRollConfigurationDialogAndClickButton(
    action,
    options = {}
)
{
    const dialog = await waitForRollConfigurationDialog(options)
    const { buttonNav, button } = findDialogButton(dialog, action)
    const dialogDescription = describeDialogMatch(options)

    if (!buttonNav) {
        throw new Error(
            `Roll-configuration dialog${dialogDescription} does not contain nav.dialog-buttons`
        )
    }

    if (!button) {
        throw new Error(
            `Roll-configuration dialog${dialogDescription} does not contain a button with data-action="${action}"`
        )
    }

    const initialButtonLabel = normalizeText(button.textContent)
    triggerButtonInteraction(button)
    await waitForNextFrame()

    if (action === "normal" && initialButtonLabel !== "Roll") {
        try {
            const followUpResult = await waitFor({
                timeout: FOLLOW_UP_ROLL_BUTTON_TIMEOUT,
                predicate: () =>
                {
                    const remainingDialog = findRollConfigurationDialog(options)

                    if (!remainingDialog || !remainingDialog.isConnected) {
                        return {
                            closed: true,
                            followUpButton: null
                        }
                    }

                    const followUpButton =
                        findDialogButton(remainingDialog, "roll").button ??
                        findDialogButtonByText(remainingDialog, "Roll")

                    return followUpButton
                        ? {
                            closed: false,
                            followUpButton
                        }
                        : false
                }
            })

            if (followUpResult?.followUpButton) {
                triggerButtonInteraction(followUpResult.followUpButton)
                await waitForNextFrame()
            }
        } catch (_err) {
            // Some roll configuration dialogs submit directly from the
            // initial Normal button and never expose a second Roll action.
        }
    }

    return dialog
}

export async function waitForRollConfigurationDialogAndClose(options = {})
{
    const dialog = await waitForRollConfigurationDialog(options)
    const closeButton = dialog.querySelector("button[data-action='close']")
    const dialogDescription = describeDialogMatch(options)

    if (!closeButton) {
        throw new Error(
            `Roll-configuration dialog${dialogDescription} does not contain a close button`
        )
    }

    triggerButtonInteraction(closeButton)
    await waitForNextFrame()

    return dialog
}
