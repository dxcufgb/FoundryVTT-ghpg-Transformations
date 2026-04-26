import {
    waitForRollConfigurationDialogAndClickButton,
    waitForRollConfigurationDialogAndClose
} from "./rollConfigurationDialog.js"

const ROLL_CONFIGURATION_DIALOG_SELECTOR =
    "dialog.application.roll-configuration"

function cleanupRollConfigurationDialogs()
{
    for (const dialog of document.querySelectorAll(
        ROLL_CONFIGURATION_DIALOG_SELECTOR
    )) {
        dialog.remove()
    }
}

function createRollConfigurationDialog({
    title = "Damage Roll",
    subtitle = "",
    buttons = [],
    includeCloseButton = true
} = {})
{
    const dialog = document.createElement("dialog")
    dialog.className = "application dnd5e2 roll-configuration"

    const header = document.createElement("header")
    header.className = "window-header"

    const titleElement = document.createElement("h4")
    titleElement.className = "window-title"
    titleElement.textContent = title
    header.append(titleElement)

    if (subtitle !== "") {
        const subtitleElement = document.createElement("div")
        subtitleElement.className = "window-subtitle"
        subtitleElement.textContent = subtitle
        header.append(subtitleElement)
    }

    if (includeCloseButton) {
        const closeButton = document.createElement("button")
        closeButton.dataset.action = "close"
        closeButton.setAttribute("aria-label", "Close Window")
        closeButton.type = "button"
        closeButton.textContent = "Close"
        header.append(closeButton)
    }

    dialog.append(header)

    const form = document.createElement("form")
    form.className = "window-content standard-form"
    form.addEventListener("submit", event =>
    {
        event.preventDefault()

        const matchingButtonConfig = buttons.find(buttonConfig =>
            buttonConfig.action === event.submitter?.dataset?.action
        )

        if (typeof matchingButtonConfig?.onSubmit === "function") {
            matchingButtonConfig.onSubmit(event)
            return
        }

        if (typeof matchingButtonConfig?.onClick === "function") {
            matchingButtonConfig.onClick(event)
        }
    })

    const buttonNav = document.createElement("nav")
    buttonNav.className = "dialog-buttons"

    for (const buttonConfig of buttons) {
        const button = document.createElement("button")
        button.type = "submit"
        button.dataset.action = buttonConfig.action
        button.textContent = buttonConfig.label
        if (typeof buttonConfig.onClick === "function") {
            button.addEventListener("click", buttonConfig.onClick)
        }
        buttonNav.append(button)
    }

    form.append(buttonNav)
    dialog.append(form)

    return dialog
}

quench.registerBatch(
    "transformations.helpers.rollConfigurationDialog",
    ({describe, it, expect, assert}) =>
    {
        describe("rollConfigurationDialog helpers", function()
        {
            this.timeout(5_000)
            let timerIds = []

            beforeEach(function()
            {
                cleanupRollConfigurationDialogs()
                timerIds = []
            })

            afterEach(function()
            {
                for (const timerId of timerIds) {
                    clearTimeout(timerId)
                }
                cleanupRollConfigurationDialogs()
            })

            it("waits for a matching roll-configuration dialog and clicks the requested action button", async function()
            {
                let clicked = false
                const nonMatchingDialog = createRollConfigurationDialog({
                    title: "Attack Roll",
                    subtitle: "Other Weapon",
                    buttons: [
                        {
                            action: "advantage",
                            label: "Advantage"
                        }
                    ]
                })

                document.body.append(nonMatchingDialog)

                timerIds.push(
                    setTimeout(() =>
                    {
                        const matchingDialog = createRollConfigurationDialog({
                            title: "Attack Roll",
                            subtitle: "Staff of Defense",
                            buttons: [
                                {
                                    action: "advantage",
                                    label: "Advantage",
                                    onClick: () =>
                                    {
                                        clicked = true
                                    }
                                },
                                {
                                    action: "normal",
                                    label: "Normal"
                                },
                                {
                                    action: "disadvantage",
                                    label: "Disadvantage"
                                }
                            ]
                        })

                        document.body.append(matchingDialog)
                    }, 10)
                )

                const dialog =
                    await waitForRollConfigurationDialogAndClickButton(
                        "advantage",
                        {
                            title: "Attack Roll",
                            subtitle: "Staff of Defense"
                        }
                    )

                expect(dialog).to.be.instanceOf(HTMLDialogElement)
                expect(dialog.querySelector(".window-subtitle")?.textContent)
                .to.equal("Staff of Defense")
                expect(clicked).to.equal(true)
            })

            it("clicks the newest matching dialog when multiple matches exist", async function()
            {
                let olderClicked = false
                let newerClicked = false
                const olderDialog = createRollConfigurationDialog({
                    title: "Damage Roll",
                    subtitle: "Shadowsteel Explosion",
                    buttons: [
                        {
                            action: "normal",
                            label: "Roll",
                            onClick: () =>
                            {
                                olderClicked = true
                            }
                        }
                    ]
                })
                const newerDialog = createRollConfigurationDialog({
                    title: "Damage Roll",
                    subtitle: "Shadowsteel Explosion",
                    buttons: [
                        {
                            action: "normal",
                            label: "Roll",
                            onClick: () =>
                            {
                                newerClicked = true
                            }
                        }
                    ]
                })

                document.body.append(olderDialog)
                document.body.append(newerDialog)

                const matchedDialog =
                    await waitForRollConfigurationDialogAndClickButton(
                        "normal",
                        {
                            title: "Damage Roll",
                            subtitle: "Shadowsteel Explosion"
                        }
                    )

                expect(matchedDialog).to.equal(newerDialog)
                expect(olderClicked).to.equal(false)
                expect(newerClicked).to.equal(true)
            })

            it("clicks the normal action button when the visible label is Roll", async function()
            {
                let clicked = false
                const dialog = createRollConfigurationDialog({
                    title: "Damage Roll",
                    subtitle: "Shadowsteel Explosion",
                    buttons: [
                        {
                            action: "normal",
                            label: "Roll",
                            onClick: () =>
                            {
                                clicked = true
                            }
                        }
                    ]
                })

                document.body.append(dialog)

                const matchedDialog =
                    await waitForRollConfigurationDialogAndClickButton(
                        "normal",
                        {
                            title: "Damage Roll",
                            subtitle: "Shadowsteel Explosion"
                        }
                    )

                expect(matchedDialog).to.equal(dialog)
                expect(clicked).to.equal(true)
            })

            it("clicks a follow-up Roll button after clicking Normal when the dialog stays open", async function()
            {
                let rollClicked = false
                const dialog = createRollConfigurationDialog({
                    title: "Damage Roll",
                    subtitle: "Shadowsteel Explosion",
                    buttons: [
                        {
                            action: "normal",
                            label: "Normal",
                            onSubmit: () =>
                            {
                                if (!buttonNav) return

                                timerIds.push(
                                    setTimeout(() =>
                                    {
                                        buttonNav.replaceChildren()

                                        const rollButton =
                                            document.createElement("button")
                                        rollButton.type = "submit"
                                        rollButton.dataset.action = "roll"
                                        rollButton.textContent = "Roll"
                                        rollButton.addEventListener("click", () =>
                                        {
                                            rollClicked = true
                                        })
                                        buttonNav.append(rollButton)
                                    }, 10)
                                )
                            }
                        }
                    ]
                })
                const buttonNav = dialog.querySelector("nav.dialog-buttons")
                document.body.append(dialog)

                await waitForRollConfigurationDialogAndClickButton("normal", {
                    title: "Damage Roll",
                    subtitle: "Shadowsteel Explosion"
                })

                expect(rollClicked).to.equal(true)
            })

            it("waits for a matching roll-configuration dialog and clicks its close button", async function()
            {
                let closed = false
                const dialog = createRollConfigurationDialog({
                    title: "Attack Roll",
                    subtitle: "Staff of Defense",
                    buttons: [
                        {
                            action: "normal",
                            label: "Normal"
                        }
                    ]
                })

                dialog
                .querySelector("button[data-action='close']")
                ?.addEventListener("click", () =>
                {
                    closed = true
                })

                document.body.append(dialog)

                const matchedDialog =
                    await waitForRollConfigurationDialogAndClose({
                        title: "Attack Roll",
                        subtitle: "Staff of Defense"
                    })

                expect(matchedDialog).to.equal(dialog)
                expect(closed).to.equal(true)
            })

            it("throws a clear error when the requested dialog button is missing", async function()
            {
                const dialog = createRollConfigurationDialog({
                    title: "Attack Roll",
                    subtitle: "Staff of Defense",
                    buttons: [
                        {
                            action: "normal",
                            label: "Normal"
                        }
                    ]
                })

                document.body.append(dialog)

                try {
                    await waitForRollConfigurationDialogAndClickButton(
                        "advantage",
                        {
                            title: "Attack Roll",
                            subtitle: "Staff of Defense",
                            timeout: 100
                        }
                    )
                    assert.fail("Expected missing dialog button error")
                } catch (err) {
                    expect(String(err?.message ?? "")).to.contain(
                        'does not contain a button with data-action="advantage"'
                    )
                }
            })

            it("throws a clear timeout error when no matching dialog appears", async function()
            {
                try {
                    await waitForRollConfigurationDialogAndClose({
                        title: "Damage Roll",
                        subtitle: "Missing Dialog",
                        timeout: 100
                    })
                    assert.fail("Expected dialog timeout error")
                } catch (err) {
                    expect(String(err?.message ?? "")).to.contain(
                        'Timed out waiting for roll-configuration dialog with title "Damage Roll" and subtitle "Missing Dialog"'
                    )
                }
            })
        })
    }
)
