import { createRecommendedSettingsService } from "../../services/settings/createRecommendedSettingsService.js"
import {
    bindGmWelcomeCard,
    buildGmWelcomeCardContent,
    GM_WELCOME_ACTIONS,
    GM_WELCOME_CARD_FLAG,
    GM_WELCOME_STATUSES,
    STATUS_APPLIED_CLASS,
    STATUS_NOT_APPLIED_CLASS
} from "../../ui/chatCards/GmWelcomeCard.js"

const logger = { debug() {}, warn() {}, error() {} }

const USER_ROLES = { NONE: 0, PLAYER: 1, TRUSTED: 2, ASSISTANT: 3, GAMEMASTER: 4 }

function createHarness({
    canModify = true,
    midiActive = true,
    midiValue = "off",
    permissions = { ACTOR_CREATE: [3, 4], TOKEN_CREATE: [3, 4], SETTINGS_MODIFY: [3, 4] },
    allowSummoning = false
} = {})
{
    const values = new Map([
        ["midi-qol.ConfigSettings", { autoItemEffects: midiValue, autoCheckSaves: "all" }],
        ["core.permissions", permissions],
        ["dnd5e.allowSummoning", allowSummoning]
    ])
    const sets = []
    const rendered = []
    class FakeMenu
    {
        render(options) { rendered.push({ menu: this.constructor.label, options }) }
    }
    class MidiMenu extends FakeMenu { static label = "midi" }
    class PermissionMenu extends FakeMenu { static label = "permissions" }

    const game = {
        user: { can: permission => canModify && permission === "SETTINGS_MODIFY" },
        modules: new Map(midiActive ? [["midi-qol", { active: true }]] : []),
        settings: {
            get: (scope, key) => values.get(`${scope}.${key}`),
            set: async (scope, key, value) =>
            {
                sets.push({ scope, key, value })
                values.set(`${scope}.${key}`, value)
            },
            menus: new Map([
                ["midi-qol.midi-qol", { type: MidiMenu }],
                ["core.permissions", { type: PermissionMenu }]
            ])
        }
    }

    const service = createRecommendedSettingsService({
        getGame: () => game,
        getConst: () => ({ USER_ROLES }),
        logger
    })
    return { service, sets, rendered, values, game }
}

quench.registerBatch(
    "transformations.infrastructure.recommendedSettings",
    ({ describe, it, expect }) =>
    {
        describe("getStatus", function()
        {
            it("reports nothing applied for a fresh world", function()
            {
                const { service } = createHarness()
                const status = service.getStatus()

                expect(status.canModify).to.equal(true)
                expect(status.midi).to.deep.include({ available: true, applied: false, current: "off" })
                expect(status.summoning).to.deep.include({
                    applied: false,
                    actorCreate: false,
                    tokenCreate: false,
                    allowSummoning: false
                })
            })

            it("reports everything applied when the recommended values are set", function()
            {
                const { service } = createHarness({
                    midiValue: "applyNoButton",
                    permissions: { ACTOR_CREATE: [1, 2, 3, 4], TOKEN_CREATE: [1, 2, 3, 4] },
                    allowSummoning: true
                })
                const status = service.getStatus()

                expect(status.midi.applied).to.equal(true)
                expect(status.summoning.applied).to.equal(true)
            })

            it("does not count summoning as applied unless both permissions and the dnd5e setting are set", function()
            {
                const { service } = createHarness({
                    permissions: { ACTOR_CREATE: [1, 2, 3, 4], TOKEN_CREATE: [3, 4] },
                    allowSummoning: true
                })

                expect(service.getStatus().summoning.applied).to.equal(false)
            })

            it("marks Midi-QOL unavailable when it is not active", function()
            {
                const { service } = createHarness({ midiActive: false })

                expect(service.getStatus().midi).to.deep.include({ available: false, applied: false })
            })
        })

        describe("applyMidiAutoItemEffects", function()
        {
            it("changes only the auto apply item effects key", async function()
            {
                const { service, sets } = createHarness()

                expect(await service.applyMidiAutoItemEffects()).to.deep.equal({ ok: true, changed: true })
                expect(sets).to.have.length(1)
                expect(sets[0].value).to.deep.equal({ autoItemEffects: "applyNoButton", autoCheckSaves: "all" })
            })

            it("does nothing when already applied", async function()
            {
                const { service, sets } = createHarness({ midiValue: "applyNoButton" })

                expect(await service.applyMidiAutoItemEffects()).to.include({ ok: true, changed: false })
                expect(sets).to.have.length(0)
            })

            it("refuses without permission to modify settings", async function()
            {
                const { service, sets } = createHarness({ canModify: false })

                expect(await service.applyMidiAutoItemEffects()).to.include({ ok: false, reason: "not-allowed" })
                expect(sets).to.have.length(0)
            })

            it("refuses when Midi-QOL is not active", async function()
            {
                const { service, sets } = createHarness({ midiActive: false })

                expect(await service.applyMidiAutoItemEffects()).to.include({ ok: false, reason: "midi-inactive" })
                expect(sets).to.have.length(0)
            })
        })

        describe("applyPlayerSummoning", function()
        {
            it("lets players create actors and tokens, keeps every other permission, and enables summoning", async function()
            {
                const { service, sets } = createHarness()

                expect(await service.applyPlayerSummoning()).to.deep.equal({ ok: true, changed: true })

                const permissions = sets.find(set => set.scope === "core").value
                expect(permissions.ACTOR_CREATE).to.deep.equal([1, 2, 3, 4])
                expect(permissions.TOKEN_CREATE).to.deep.equal([1, 2, 3, 4])
                expect(permissions.SETTINGS_MODIFY).to.deep.equal([3, 4])
                expect(sets.find(set => set.scope === "dnd5e")).to.deep.include({ key: "allowSummoning", value: true })
            })

            it("only writes what is missing", async function()
            {
                const { service, sets } = createHarness({
                    permissions: { ACTOR_CREATE: [1, 2, 3, 4], TOKEN_CREATE: [1, 2, 3, 4] }
                })

                await service.applyPlayerSummoning()

                expect(sets.map(set => set.scope)).to.deep.equal(["dnd5e"])
            })

            it("does not mutate the stored permissions object in place", async function()
            {
                const { service, values } = createHarness()
                const before = JSON.stringify(values.get("core.permissions"))
                const stored = values.get("core.permissions")

                await service.applyPlayerSummoning()

                expect(JSON.stringify(stored)).to.equal(before)
            })

            it("does nothing when already applied", async function()
            {
                const { service, sets } = createHarness({
                    permissions: { ACTOR_CREATE: [1, 2, 3, 4], TOKEN_CREATE: [1, 2, 3, 4] },
                    allowSummoning: true
                })

                expect(await service.applyPlayerSummoning()).to.include({ ok: true, changed: false })
                expect(sets).to.have.length(0)
            })

            it("refuses without permission to modify settings", async function()
            {
                const { service, sets } = createHarness({ canModify: false })

                expect(await service.applyPlayerSummoning()).to.include({ ok: false, reason: "not-allowed" })
                expect(sets).to.have.length(0)
            })
        })

        describe("opening the settings menus", function()
        {
            it("opens the Midi-QOL and user permission menus", function()
            {
                const { service, rendered } = createHarness()

                expect(service.openMidiSettings()).to.equal(true)
                expect(service.openPermissionSettings()).to.equal(true)
                expect(rendered.map(entry => entry.menu)).to.deep.equal(["midi", "permissions"])
                expect(rendered[0].options).to.deep.equal({ force: true })
            })

            it("returns false when a menu is not registered", function()
            {
                const { service, game } = createHarness()
                game.settings.menus.delete("midi-qol.midi-qol")

                expect(service.openMidiSettings()).to.equal(false)
            })
        })

        describe("GM welcome card", function()
        {
            const flagged = { flags: { transformations: { [GM_WELCOME_CARD_FLAG]: true } } }

            function renderCard(harnessOptions, { message = flagged } = {})
            {
                const harness = createHarness(harnessOptions)
                const notifications = { info: [], warn: [], error: [] }
                const html = document.createElement("div")
                html.innerHTML = buildGmWelcomeCardContent()

                bindGmWelcomeCard({
                    message,
                    html,
                    settingsService: harness.service,
                    notifier: {
                        info: text => notifications.info.push(text),
                        warn: text => notifications.warn.push(text),
                        error: text => notifications.error.push(text)
                    },
                    logger
                })

                const button = action => html.querySelector(`[data-transformations-welcome-action="${action}"]`)
                const status = name => html.querySelector(`[data-transformations-welcome-status="${name}"]`)
                const settle = () => new Promise(resolve => setTimeout(resolve, 20))
                return { ...harness, html, notifications, button, status, settle }
            }

            it("offers an apply and an open button for each described setting", function()
            {
                const { button } = renderCard()

                for (const action of Object.values(GM_WELCOME_ACTIONS)) {
                    expect(button(action), action).to.not.equal(null)
                }
            })

            it("applies the Midi-QOL setting from its button and marks it applied", async function()
            {
                const { button, sets, notifications, settle } = renderCard()

                button(GM_WELCOME_ACTIONS.APPLY_MIDI).click()
                await settle()

                expect(sets[0].value.autoItemEffects).to.equal("applyNoButton")
                expect(button(GM_WELCOME_ACTIONS.APPLY_MIDI).disabled).to.equal(true)
                expect(button(GM_WELCOME_ACTIONS.APPLY_MIDI).textContent).to.contain("Applied")
                expect(notifications.info).to.have.length(1)
            })

            it("enables player summoning from its button", async function()
            {
                const { button, sets, settle } = renderCard()

                button(GM_WELCOME_ACTIONS.APPLY_SUMMONING).click()
                await settle()

                expect(sets.map(set => set.scope)).to.have.members(["core", "dnd5e"])
                expect(button(GM_WELCOME_ACTIONS.APPLY_SUMMONING).disabled).to.equal(true)
            })

            it("shows already applied settings as disabled from the start", function()
            {
                const { button } = renderCard({ midiValue: "applyNoButton" })

                expect(button(GM_WELCOME_ACTIONS.APPLY_MIDI).disabled).to.equal(true)
                expect(button(GM_WELCOME_ACTIONS.APPLY_SUMMONING).disabled).to.equal(false)
            })

            it("disables the apply buttons without permission but keeps the menu buttons usable", async function()
            {
                const { button, rendered, settle } = renderCard({ canModify: false })

                expect(button(GM_WELCOME_ACTIONS.APPLY_MIDI).disabled).to.equal(true)
                expect(button(GM_WELCOME_ACTIONS.APPLY_SUMMONING).disabled).to.equal(true)

                button(GM_WELCOME_ACTIONS.OPEN_PERMISSIONS).click()
                await settle()
                expect(rendered.map(entry => entry.menu)).to.deep.equal(["permissions"])
            })

            it("disables the Midi-QOL apply button when Midi-QOL is not active", function()
            {
                const { button } = renderCard({ midiActive: false })

                expect(button(GM_WELCOME_ACTIONS.APPLY_MIDI).disabled).to.equal(true)
            })

            it("opens the Midi-QOL menu from its fallback button", async function()
            {
                const { button, rendered, settle } = renderCard()

                button(GM_WELCOME_ACTIONS.OPEN_MIDI).click()
                await settle()

                expect(rendered.map(entry => entry.menu)).to.deep.equal(["midi"])
            })

            it("ignores messages that are not the welcome card", function()
            {
                const { button } = renderCard({}, { message: { flags: {} } })

                button(GM_WELCOME_ACTIONS.APPLY_MIDI).click()

                expect(button(GM_WELCOME_ACTIONS.APPLY_MIDI).textContent).to.contain("Apply this setting")
            })

            describe("colours and status buttons", function()
            {
                it("shows red 'Not applied' apply buttons for a fresh world", function()
                {
                    const { button } = renderCard()

                    for (const action of [GM_WELCOME_ACTIONS.APPLY_MIDI, GM_WELCOME_ACTIONS.APPLY_SUMMONING]) {
                        expect(button(action).classList.contains(STATUS_NOT_APPLIED_CLASS), action).to.equal(true)
                        expect(button(action).classList.contains(STATUS_APPLIED_CLASS), action).to.equal(false)
                        expect(button(action).textContent).to.contain("Not applied")
                    }
                })

                it("turns the apply buttons green and 'Applied' once the settings are set", function()
                {
                    const { button } = renderCard({
                        midiValue: "applyNoButton",
                        permissions: { ACTOR_CREATE: [1, 2, 3, 4], TOKEN_CREATE: [1, 2, 3, 4] },
                        allowSummoning: true
                    })

                    for (const action of [GM_WELCOME_ACTIONS.APPLY_MIDI, GM_WELCOME_ACTIONS.APPLY_SUMMONING]) {
                        expect(button(action).classList.contains(STATUS_APPLIED_CLASS), action).to.equal(true)
                        expect(button(action).classList.contains(STATUS_NOT_APPLIED_CLASS), action).to.equal(false)
                        expect(button(action).textContent).to.contain("Applied")
                    }
                })

                it("changes an apply button from red to green after it is clicked", async function()
                {
                    const { button, settle } = renderCard()

                    button(GM_WELCOME_ACTIONS.APPLY_MIDI).click()
                    await settle()

                    expect(button(GM_WELCOME_ACTIONS.APPLY_MIDI).classList.contains(STATUS_APPLIED_CLASS)).to.equal(true)
                    expect(button(GM_WELCOME_ACTIONS.APPLY_SUMMONING).classList.contains(STATUS_NOT_APPLIED_CLASS)).to.equal(true)
                })

                it("gives the permissions and the Allow summoning buttons their own status", function()
                {
                    const { status } = renderCard()

                    expect(status(GM_WELCOME_STATUSES.PERMISSIONS)).to.not.equal(null)
                    expect(status(GM_WELCOME_STATUSES.SUMMONING_SETTING)).to.not.equal(null)
                })

                it("reports each part of the summoning setup separately", function()
                {
                    const { status } = renderCard({
                        permissions: { ACTOR_CREATE: [1, 2, 3, 4], TOKEN_CREATE: [1, 2, 3, 4] },
                        allowSummoning: false
                    })

                    expect(status(GM_WELCOME_STATUSES.PERMISSIONS).classList.contains(STATUS_APPLIED_CLASS)).to.equal(true)
                    expect(status(GM_WELCOME_STATUSES.SUMMONING_SETTING).classList.contains(STATUS_NOT_APPLIED_CLASS)).to.equal(true)
                    expect(status(GM_WELCOME_STATUSES.SUMMONING_SETTING).textContent).to.contain("off")
                })

                it("names what is missing when only some permissions are granted", function()
                {
                    const onlyActors = renderCard({ permissions: { ACTOR_CREATE: [1, 2, 3, 4], TOKEN_CREATE: [3, 4] } })
                    const onlyTokens = renderCard({ permissions: { ACTOR_CREATE: [3, 4], TOKEN_CREATE: [1, 2, 3, 4] } })
                    const neither = renderCard()

                    expect(onlyActors.status(GM_WELCOME_STATUSES.PERMISSIONS).textContent).to.contain("tokens")
                    expect(onlyActors.status(GM_WELCOME_STATUSES.PERMISSIONS).textContent).to.not.contain("actors")
                    expect(onlyTokens.status(GM_WELCOME_STATUSES.PERMISSIONS).textContent).to.contain("actors")
                    expect(onlyTokens.status(GM_WELCOME_STATUSES.PERMISSIONS).textContent).to.not.contain("tokens")
                    expect(neither.status(GM_WELCOME_STATUSES.PERMISSIONS).textContent).to.contain("actors or tokens")
                })

                it("updates the status buttons after the summoning button is clicked", async function()
                {
                    const { button, status, settle } = renderCard()

                    button(GM_WELCOME_ACTIONS.APPLY_SUMMONING).click()
                    await settle()

                    expect(status(GM_WELCOME_STATUSES.PERMISSIONS).classList.contains(STATUS_APPLIED_CLASS)).to.equal(true)
                    expect(status(GM_WELCOME_STATUSES.SUMMONING_SETTING).classList.contains(STATUS_APPLIED_CLASS)).to.equal(true)
                })

                it("keeps the status buttons read-only", async function()
                {
                    const { status, sets, rendered, settle } = renderCard()

                    status(GM_WELCOME_STATUSES.PERMISSIONS).click()
                    status(GM_WELCOME_STATUSES.SUMMONING_SETTING).click()
                    await settle()

                    expect(status(GM_WELCOME_STATUSES.PERMISSIONS).disabled).to.equal(true)
                    expect(sets).to.have.length(0)
                    expect(rendered).to.have.length(0)
                })
            })

            it("binds only once when the card is rendered again", async function()
            {
                const { html, button, sets, service, settle } = renderCard()

                bindGmWelcomeCard({
                    message: flagged,
                    html,
                    settingsService: service,
                    notifier: { info() {}, warn() {}, error() {} },
                    logger
                })
                button(GM_WELCOME_ACTIONS.APPLY_MIDI).click()
                await settle()

                expect(sets).to.have.length(1)
            })
        })
    }
)
