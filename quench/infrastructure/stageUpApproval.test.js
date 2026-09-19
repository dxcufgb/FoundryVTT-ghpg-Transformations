import { createSettingsMenu } from "../../bootstrap/createSettingsMenu.js"
import {
    CANCEL_STAGE_UP_APPROVAL_EVENT,
    createStageUpApprovalService
} from "../../services/transformations/createStageUpApprovalService.js"
import { createTransformationPillController } from "../../ui/controllers/transformationPillController.js"

const logger = { debug() {}, warn() {}, error() {} }

const PLAYER = { id: "player-1", name: "Pat", isGM: false }
const GM = { id: "gm-1", name: "Gwen", isGM: true }

function createActor()
{
    return {
        id: "actor-1",
        uuid: "Actor.actor-1",
        name: "Bruna",
        flags: { transformations: { type: "vampire", stage: 2 } }
    }
}

/**
 * approval: what the GM's decision dialog resolves to (true / false / null), or "pending" to leave
 *           it open until closeStageUpApprovalDialog() is called.
 * abort:    true = the player presses Abort on the waiting dialog instead of waiting for the GM.
 */
function createHarness({ askGm = true, gmOnline = true, approval = true, abort = false, currentUser = PLAYER } = {})
{
    const calls = {
        sent: [],
        warnings: [],
        errors: [],
        approvalDialogs: [],
        closedApprovalDialogs: [],
        waitingDialogs: [],
        rejectedDialogs: []
    }
    const settings = new Map([["transformations.askGmBeforeStageUp", askGm]])
    const users = { get: id => (id === PLAYER.id ? PLAYER : GM), activeGM: gmOnline ? GM : null }
    const actor = createActor()
    let resolveApprovalDialog = null

    const dialogFactory = {
        openStageUpApprovalDialog: data =>
        {
            calls.approvalDialogs.push(data)
            if (approval !== "pending") return Promise.resolve(approval)
            return new Promise(resolve =>
            {
                resolveApprovalDialog = resolve
            })
        },
        closeStageUpApprovalDialog: requestId =>
        {
            calls.closedApprovalDialogs.push(requestId)
            resolveApprovalDialog?.(null)
        },
        openStageUpWaitingDialog: () =>
        {
            const dialog = {
                closed: false,
                aborted: abort ? Promise.resolve(true) : new Promise(() => {}),
                close() { dialog.closed = true }
            }
            calls.waitingDialogs.push(dialog)
            return dialog
        },
        openStageUpRejectedDialog: async data =>
        {
            calls.rejectedDialogs.push(data)
        }
    }

    const service = createStageUpApprovalService({
        moduleId: "transformations",
        getGame: () => ({
            user: currentUser,
            users,
            settings: { get: (scope, key) => settings.get(`${scope}.${key}`) }
        }),
        socketGateway: {
            executeAsUser: async (type, userId, payload) =>
            {
                calls.sent.push({ type, userId, payload })
                if (type === CANCEL_STAGE_UP_APPROVAL_EVENT) return service.cancelApprovalRequest(payload)
                if (approval instanceof Error) throw approval
                // The GM's client answers; with abort the player has already given up waiting.
                return abort ? new Promise(() => {}) : service.handleApprovalRequest(payload)
            }
        },
        getDialogFactory: () => dialogFactory,
        notifier: {
            warn: message => calls.warnings.push(message),
            error: message => calls.errors.push(message)
        },
        transformationRegistry: {
            getEntryForActor: () => ({ TransformationClass: { displayName: "Vampire" } })
        },
        logger
    })

    return { service, calls, actor }
}

quench.registerBatch(
    "transformations.StageUpApproval",
    ({ describe, it, expect }) =>
    {
        const originalFromUuid = globalThis.fromUuid

        beforeEach(function()
        {
            const actor = createActor()
            globalThis.fromUuid = async uuid => (uuid === actor.uuid ? actor : null)
        })

        afterEach(function()
        {
            globalThis.fromUuid = originalFromUuid
        })

        describe("setting", function()
        {
            it("registers 'Ask GM before stage up' as a world boolean that defaults to off", function()
            {
                const registered = new Map()
                createSettingsMenu({
                    MODULE_ID: "transformations",
                    game: {
                        user: { role: 4 },
                        settings: {
                            register: (module, key, data) => registered.set(key, data),
                            registerMenu() {}
                        }
                    },
                    TransformationsDebugApplication: class {}
                })

                const setting = registered.get("askGmBeforeStageUp")
                expect(setting.name).to.equal("Ask GM before stage up")
                expect(setting.type).to.equal(Boolean)
                expect(setting.scope).to.equal("world")
                expect(setting.default).to.equal(false)
            })
        })

        describe("requestApproval", function()
        {
            it("approves without asking when the setting is off", async function()
            {
                const { service, calls, actor } = createHarness({ askGm: false })

                expect(await service.requestApproval({ actor, toStage: 3 })).to.equal(true)
                expect(calls.sent.length).to.equal(0)
                expect(calls.waitingDialogs.length).to.equal(0)
            })

            it("approves without asking when the requesting user is a GM", async function()
            {
                const { service, calls, actor } = createHarness({ currentUser: GM })

                expect(await service.requestApproval({ actor, toStage: 3 })).to.equal(true)
                expect(calls.sent.length).to.equal(0)
            })

            it("asks the active GM and returns true when they approve", async function()
            {
                const { service, calls, actor } = createHarness({ approval: true })

                expect(await service.requestApproval({ actor, toStage: 3 })).to.equal(true)
                expect(calls.sent[0].userId).to.equal("gm-1")
                expect(calls.sent[0].payload).to.include({
                    actorUuid: "Actor.actor-1",
                    requestingUserId: "player-1",
                    toStage: 3
                })
                expect(calls.sent[0].payload.requestId).to.be.a("string")
                expect(calls.rejectedDialogs.length).to.equal(0)
            })

            it("shows a waiting dialog while the GM decides and removes it afterwards", async function()
            {
                const { service, calls, actor } = createHarness({ approval: true })

                await service.requestApproval({ actor, toStage: 3 })

                expect(calls.waitingDialogs.length).to.equal(1)
                expect(calls.waitingDialogs[0].closed).to.equal(true)
            })

            it("returns false and shows the rejection dialog when the GM says no", async function()
            {
                const { service, calls, actor } = createHarness({ approval: false })

                expect(await service.requestApproval({ actor, toStage: 3 })).to.equal(false)
                expect(calls.rejectedDialogs).to.deep.equal([
                    { characterName: "Bruna", transformationName: "Vampire" }
                ])
                expect(calls.waitingDialogs[0].closed).to.equal(true)
            })

            it("treats a dismissed GM dialog as a rejection", async function()
            {
                const { service, calls, actor } = createHarness({ approval: null })

                expect(await service.requestApproval({ actor, toStage: 3 })).to.equal(false)
                expect(calls.rejectedDialogs.length).to.equal(1)
            })

            it("returns false and warns the player when no GM is online", async function()
            {
                const { service, calls, actor } = createHarness({ gmOnline: false })

                expect(await service.requestApproval({ actor, toStage: 3 })).to.equal(false)
                expect(calls.sent.length).to.equal(0)
                expect(calls.waitingDialogs.length).to.equal(0)
                expect(calls.warnings.length).to.equal(1)
            })

            it("returns false when the request itself fails", async function()
            {
                const { service, calls, actor } = createHarness({ approval: new Error("socket down") })

                expect(await service.requestApproval({ actor, toStage: 3 })).to.equal(false)
                expect(calls.errors.length).to.equal(1)
                expect(calls.waitingDialogs[0].closed).to.equal(true)
            })

            it("aborts: tells the same GM to cancel, and shows no rejection", async function()
            {
                const { service, calls, actor } = createHarness({ abort: true })

                expect(await service.requestApproval({ actor, toStage: 3 })).to.equal(false)

                const [request, cancel] = calls.sent
                expect(cancel.type).to.equal(CANCEL_STAGE_UP_APPROVAL_EVENT)
                expect(cancel.userId).to.equal(request.userId)
                expect(cancel.payload.requestId).to.equal(request.payload.requestId)
                expect(calls.rejectedDialogs.length).to.equal(0)
                expect(calls.waitingDialogs[0].closed).to.equal(true)
            })
        })

        describe("handleApprovalRequest", function()
        {
            const payload = {
                requestId: "req-1",
                actorUuid: "Actor.actor-1",
                requestingUserId: "player-1",
                toStage: 3
            }

            it("shows the GM who wants which stage for which character", async function()
            {
                const { service, calls } = createHarness()
                await service.handleApprovalRequest(payload)

                expect(calls.approvalDialogs[0]).to.deep.equal({
                    requestId: "req-1",
                    requestingUserName: "Pat",
                    characterName: "Bruna",
                    transformationName: "Vampire",
                    toStage: 3
                })
            })

            it("reports approved / rejected outcomes", async function()
            {
                expect(await createHarness({ approval: true }).service.handleApprovalRequest(payload))
                    .to.deep.equal({ outcome: "approved" })
                expect(await createHarness({ approval: false }).service.handleApprovalRequest(payload))
                    .to.deep.equal({ outcome: "rejected" })
                expect(await createHarness({ approval: null }).service.handleApprovalRequest(payload))
                    .to.deep.equal({ outcome: "rejected" })
            })

            it("reports unresolved when the actor cannot be found", async function()
            {
                const { service } = createHarness()
                globalThis.fromUuid = async () => null

                expect(await service.handleApprovalRequest(payload)).to.deep.equal({ outcome: "unresolved" })
            })

            it("removes the GM's dialog when the player aborts, without treating it as a rejection", async function()
            {
                const { service, calls } = createHarness({ approval: "pending" })

                const handling = service.handleApprovalRequest(payload)
                await new Promise(resolve => setTimeout(resolve, 0))
                service.cancelApprovalRequest({ requestId: "req-1" })

                expect(await handling).to.deep.equal({ outcome: "cancelled" })
                expect(calls.closedApprovalDialogs).to.deep.equal(["req-1"])
            })

            it("skips a request whose abort arrived before it could be shown", async function()
            {
                const { service, calls } = createHarness()
                service.cancelApprovalRequest({ requestId: "req-1" })

                expect(await service.handleApprovalRequest(payload)).to.deep.equal({ outcome: "cancelled" })
                expect(calls.approvalDialogs.length).to.equal(0)
            })

            it("ignores a cancel for a request that is not open", function()
            {
                const { service, calls } = createHarness()

                service.cancelApprovalRequest({ requestId: "unknown" })

                expect(calls.closedApprovalDialogs.length).to.equal(0)
            })
        })

        describe("pill controller stage button", function()
        {
            function setup({ requestApproval })
            {
                const updates = []
                const actor = {
                    id: "actor-1",
                    flags: { transformations: { stage: 2 } },
                    update: async data => updates.push(data)
                }
                const pillElement = document.createElement("div")
                pillElement.innerHTML = '<button data-action="pill-config-stage"></button>'

                const controller = createTransformationPillController({
                    dialogs: {},
                    stageUpApprovalService: { requestApproval },
                    logger
                })
                controller.bind({
                    app: { actor },
                    pillElement,
                    viewModel: { mode: "stage", editable: true },
                    transformation: {},
                    transformations: []
                })
                const click = () => pillElement.querySelector("button").click()
                return { updates, click }
            }

            const settle = () => new Promise(resolve => setTimeout(resolve, 20))

            it("raises the stage once approved", async function()
            {
                const asked = []
                const { updates, click } = setup({
                    requestApproval: async data => (asked.push(data), true)
                })

                click()
                await settle()

                expect(asked[0].toStage).to.equal(3)
                expect(updates).to.deep.equal([{ "flags.transformations.stage": 3 }])
            })

            it("leaves the stage untouched when approval is denied", async function()
            {
                const { updates, click } = setup({ requestApproval: async () => false })

                click()
                await settle()

                expect(updates.length).to.equal(0)
            })

            it("ignores repeat clicks while a request is pending", async function()
            {
                let calls = 0
                let release
                const { updates, click } = setup({
                    requestApproval: () =>
                    {
                        calls++
                        return new Promise(resolve => { release = () => resolve(true) })
                    }
                })

                click()
                click()
                await settle()
                release()
                await settle()

                expect(calls).to.equal(1)
                expect(updates.length).to.equal(1)
            })
        })
    }
)
