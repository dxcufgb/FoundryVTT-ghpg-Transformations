import { createSettingsMenu } from "../../bootstrap/createSettingsMenu.js"
import {
    canUseChangeTransformationControl,
    canUseDowngradeTransformationControl,
    isChangeTransformationAllowedForUser,
    isDowngradeTransformationAllowedForUser,
    parseDowngradeMinimumRole,
    registerActorSheetControlsAdapter
} from "../../ui/adapters/actorSheetControlsAdapter.js"

function createLogger()
{
    return {
        debug() {},
        warn() {},
        error() {}
    }
}

function createDebouncedTracker()
{
    return {
        pulse() {}
    }
}

class TestActor
{
    constructor({
        transformationId = "test-transformation",
        stage = 2,
        type = "character"
    } = {})
    {
        this.type = type
        this.flags = {
            transformations: {
                type: transformationId,
                stage
            }
        }
    }

    getFlag(scope, key)
    {
        return this.flags?.[scope]?.[key] ?? null
    }
}

function createApp(actor)
{
    return {
        document: actor,
        actor,
        renderCalls: [],
        async render(force)
        {
            this.renderCalls.push(force)
        }
    }
}

function createGame({
    isGM = false,
    role = 1,
    setting = 4,
    downgradeSetting = setting,
    changeSetting = setting
} = {})
{
    return {
        user: {
            id: "user-1",
            isGM,
            role
        },
        settings: {
            get(moduleId, settingName)
            {
                if (
                    moduleId === "transformations" &&
                    settingName === "downgradeTransformationAllowedRoles"
                ) {
                    return downgradeSetting
                }

                if (
                    moduleId === "transformations" &&
                    settingName === "changeTransformationAllowedRoles"
                ) {
                    return changeSetting
                }

                return null
            }
        }
    }
}

function createModuleUi(game)
{
    return {
        policies: {
            canShowTransformationControls()
            {
                return game.user.isGM === true
            }
        },
        dialogs: {
            async openTransformationConfig() {}
        }
    }
}

function registerHarness({
    game,
    transformationService
})
{
    const originalHooks = globalThis.Hooks
    const callbacks = new Map()

    globalThis.Hooks = {
        on(name, callback)
        {
            callbacks.set(name, callback)
        }
    }

    registerActorSheetControlsAdapter({
        game,
        ActorClass: TestActor,
        transformationService,
        transformationQueryService: {
            async getAll()
            {
                return []
            }
        },
        debouncedTracker: createDebouncedTracker(),
        moduleUi: createModuleUi(game),
        logger: createLogger()
    })

    return {
        callback: callbacks.get("getHeaderControlsApplicationV2"),
        restore()
        {
            globalThis.Hooks = originalHooks
        }
    }
}

quench.registerBatch(
    "transformations.infrastructure.actorSheetControlsAdapter",
    ({describe, it, expect}) =>
    {
        describe("downgrade actor sheet control", function()
        {
            it("appears only for an active downgradeable transformation with permission", function()
            {
                const game = createGame({
                    role: 2,
                    setting: 2
                })
                const harness = registerHarness({
                    game,
                    transformationService: {
                        async downgradeTransformationStage() {}
                    }
                })

                try {
                    const controls = []
                    harness.callback(createApp(new TestActor()), controls)

                    expect(controls.some(control =>
                        control.action === "transformation-downgrade-stage"
                    )).to.equal(true)

                    const inactiveControls = []
                    harness.callback(
                        createApp(new TestActor({
                            transformationId: null,
                            stage: 2
                        })),
                        inactiveControls
                    )
                    expect(inactiveControls.some(control =>
                        control.action === "transformation-downgrade-stage"
                    )).to.equal(false)

                    const minimumStageControls = []
                    harness.callback(
                        createApp(new TestActor({
                            stage: 1
                        })),
                        minimumStageControls
                    )
                    expect(minimumStageControls.some(control =>
                        control.action === "transformation-downgrade-stage"
                    )).to.equal(false)
                } finally {
                    harness.restore()
                }
            })

            it("does not appear when the user lacks the configured role", function()
            {
                const game = createGame({
                    role: 1,
                    setting: 2
                })
                const controls = []

                const allowed = canUseDowngradeTransformationControl({
                    app: createApp(new TestActor()),
                    game,
                    ActorClass: TestActor
                })

                expect(allowed).to.equal(false)

                const harness = registerHarness({
                    game,
                    transformationService: {
                        async downgradeTransformationStage() {}
                    }
                })

                try {
                    harness.callback(createApp(new TestActor()), controls)
                    expect(controls.some(control =>
                        control.action === "transformation-downgrade-stage"
                    )).to.equal(false)
                } finally {
                    harness.restore()
                }
            })

            it("does not appear for an assistant GM when GM is the configured minimum role", function()
            {
                const game = createGame({
                    isGM: true,
                    role: 3,
                    setting: 4
                })
                const controls = []
                const harness = registerHarness({
                    game,
                    transformationService: {
                        async downgradeTransformationStage() {}
                    }
                })

                try {
                    harness.callback(createApp(new TestActor()), controls)
                    expect(controls.some(control =>
                        control.action === "transformation-downgrade-stage"
                    )).to.equal(false)
                } finally {
                    harness.restore()
                }
            })

            it("calls the downgrade service when clicked", async function()
            {
                const game = createGame({
                    role: 1,
                    setting: 1
                })
                const calls = []
                const actor = new TestActor()
                const app = createApp(actor)
                const harness = registerHarness({
                    game,
                    transformationService: {
                        async downgradeTransformationStage(clickedActor, options)
                        {
                            calls.push({clickedActor, options})
                            return {
                                ok: true
                            }
                        }
                    }
                })

                try {
                    const controls = []
                    harness.callback(app, controls)
                    const control = controls.find(entry =>
                        entry.action === "transformation-downgrade-stage"
                    )

                    expect(control).to.exist
                    await control.onClick()
                    expect(calls).to.deep.equal([{
                        clickedActor: actor,
                        options: {
                            triggeringUserId: "user-1"
                        }
                    }])
                    expect(app.renderCalls).to.deep.equal([true])
                } finally {
                    harness.restore()
                }
            })

            it("always allows GMs even when the setting is misconfigured", function()
            {
                const game = createGame({
                    isGM: true,
                    role: 4,
                    setting: ""
                })

                expect(isDowngradeTransformationAllowedForUser({game}))
                .to.equal(true)
                expect(canUseDowngradeTransformationControl({
                    app: createApp(new TestActor()),
                    game,
                    ActorClass: TestActor
                })).to.equal(true)
            })

            it("allows the selected role or higher", function()
            {
                expect(isDowngradeTransformationAllowedForUser({
                    game: createGame({
                        role: 1,
                        setting: 2
                    })
                })).to.equal(false)
                expect(isDowngradeTransformationAllowedForUser({
                    game: createGame({
                        role: 2,
                        setting: 2
                    })
                })).to.equal(true)
                expect(isDowngradeTransformationAllowedForUser({
                    game: createGame({
                        isGM: true,
                        role: 3,
                        setting: 2
                    })
                })).to.equal(true)
            })

            it("parses the minimum role setting", function()
            {
                expect(parseDowngradeMinimumRole(2)).to.equal(2)
                expect(parseDowngradeMinimumRole("3")).to.equal(3)
                expect(parseDowngradeMinimumRole("")).to.equal(4)
            })
        })

        describe("change transformation actor sheet control", function()
        {
            it("appears only when the user meets the configured role", function()
            {
                const allowedGame = createGame({
                    role: 2,
                    changeSetting: 2,
                    downgradeSetting: 4
                })
                const allowedControls = []
                const allowedHarness = registerHarness({
                    game: allowedGame,
                    transformationService: {
                        async downgradeTransformationStage() {}
                    }
                })

                try {
                    allowedHarness.callback(
                        createApp(new TestActor()),
                        allowedControls
                    )
                    expect(allowedControls.some(control =>
                        control.action === "transformation-GM-config"
                    )).to.equal(true)
                } finally {
                    allowedHarness.restore()
                }

                const deniedGame = createGame({
                    role: 1,
                    changeSetting: 2,
                    downgradeSetting: 1
                })
                const deniedControls = []
                const deniedHarness = registerHarness({
                    game: deniedGame,
                    transformationService: {
                        async downgradeTransformationStage() {}
                    }
                })

                try {
                    deniedHarness.callback(
                        createApp(new TestActor()),
                        deniedControls
                    )
                    expect(deniedControls.some(control =>
                        control.action === "transformation-GM-config"
                    )).to.equal(false)
                } finally {
                    deniedHarness.restore()
                }
            })

            it("does not appear for an assistant GM when GM is the configured minimum role", function()
            {
                const game = createGame({
                    isGM: true,
                    role: 3,
                    changeSetting: 4,
                    downgradeSetting: 3
                })
                const controls = []
                const harness = registerHarness({
                    game,
                    transformationService: {
                        async downgradeTransformationStage() {}
                    }
                })

                try {
                    harness.callback(createApp(new TestActor()), controls)
                    expect(controls.some(control =>
                        control.action === "transformation-GM-config"
                    )).to.equal(false)
                } finally {
                    harness.restore()
                }
            })

            it("opens the transformation config when clicked", async function()
            {
                const game = createGame({
                    role: 1,
                    changeSetting: 1,
                    downgradeSetting: 4
                })
                const actor = new TestActor()
                const transformations = [{id: "test-transformation"}]
                const dialogCalls = []
                const originalHooks = globalThis.Hooks
                const callbacks = new Map()

                globalThis.Hooks = {
                    on(name, callback)
                    {
                        callbacks.set(name, callback)
                    }
                }

                try {
                    registerActorSheetControlsAdapter({
                        game,
                        ActorClass: TestActor,
                        transformationService: {
                            async downgradeTransformationStage() {}
                        },
                        transformationQueryService: {
                            async getAll()
                            {
                                return transformations
                            }
                        },
                        debouncedTracker: createDebouncedTracker(),
                        moduleUi: {
                            policies: {
                                canShowTransformationControls()
                                {
                                    return false
                                }
                            },
                            dialogs: {
                                async openTransformationConfig(data)
                                {
                                    dialogCalls.push(data)
                                }
                            }
                        },
                        logger: createLogger()
                    })

                    const controls = []
                    callbacks.get("getHeaderControlsApplicationV2")(
                        createApp(actor),
                        controls
                    )
                    const control = controls.find(entry =>
                        entry.action === "transformation-GM-config"
                    )

                    expect(control).to.exist
                    await control.onClick()
                    expect(dialogCalls).to.deep.equal([{
                        actor,
                        transformations,
                        triggeringUserId: "user-1"
                    }])
                } finally {
                    globalThis.Hooks = originalHooks
                }
            })

            it("uses selected role or higher logic", function()
            {
                expect(isChangeTransformationAllowedForUser({
                    game: createGame({
                        role: 1,
                        changeSetting: 2
                    })
                })).to.equal(false)
                expect(isChangeTransformationAllowedForUser({
                    game: createGame({
                        role: 2,
                        changeSetting: 2
                    })
                })).to.equal(true)
                expect(isChangeTransformationAllowedForUser({
                    game: createGame({
                        isGM: true,
                        role: 3,
                        changeSetting: 2
                    })
                })).to.equal(true)
                expect(canUseChangeTransformationControl({
                    app: createApp(new TestActor()),
                    game: createGame({
                        role: 2,
                        changeSetting: 2
                    }),
                    ActorClass: TestActor
                })).to.equal(true)
            })
        })

        describe("role settings", function()
        {
            it("registers GM-restricted role settings with GM-only defaults", function()
            {
                const originalConst = globalThis.CONST
                const registrations = []
                const menus = []

                globalThis.CONST = {
                    ...(originalConst ?? {}),
                    USER_ROLES: {
                        PLAYER: 1,
                        TRUSTED: 2,
                        ASSISTANT: 3,
                        GAMEMASTER: 4
                    }
                }

                try {
                    createSettingsMenu({
                        MODULE_ID: "transformations",
                        game: {
                            user: {
                                role: 4
                            },
                            settings: {
                                register(moduleId, key, options)
                                {
                                    registrations.push({
                                        moduleId,
                                        key,
                                        options
                                    })
                                },
                                registerMenu(moduleId, key, options)
                                {
                                    menus.push({
                                        moduleId,
                                        key,
                                        options
                                    })
                                }
                            }
                        },
                        TransformationsDebugApplication: class {}
                    })
                } finally {
                    globalThis.CONST = originalConst
                }

                const setting = registrations.find(entry =>
                    entry.key === "downgradeTransformationAllowedRoles"
                )
                const changeSetting = registrations.find(entry =>
                    entry.key === "changeTransformationAllowedRoles"
                )

                expect(setting).to.exist
                expect(setting.moduleId).to.equal("transformations")
                expect(setting.options.scope).to.equal("world")
                expect(setting.options.config).to.equal(true)
                expect(setting.options.restricted).to.equal(true)
                expect(setting.options.type).to.equal(Number)
                expect(setting.options.default).to.equal(4)
                expect(setting.options.hint)
                .to.equal("Players with selected or higher can downgrade their transformation")
                expect(setting.options.choices).to.deep.equal({
                    4: "GM",
                    3: "Assisting GM",
                    2: "Trusted Player",
                    1: "Player"
                })
                expect(changeSetting).to.exist
                expect(changeSetting.moduleId).to.equal("transformations")
                expect(changeSetting.options.scope).to.equal("world")
                expect(changeSetting.options.config).to.equal(true)
                expect(changeSetting.options.restricted).to.equal(true)
                expect(changeSetting.options.type).to.equal(Number)
                expect(changeSetting.options.default).to.equal(4)
                expect(changeSetting.options.choices).to.deep.equal({
                    4: "GM",
                    3: "Assisting GM",
                    2: "Trusted Player",
                    1: "Player"
                })
                expect(menus.some(menu => menu.key === "debugMenu"))
                .to.equal(true)
            })

            it("hides all settings from assistant GM and lower roles", function()
            {
                const originalConst = globalThis.CONST
                const registrations = []
                const menus = []

                globalThis.CONST = {
                    ...(originalConst ?? {}),
                    USER_ROLES: {
                        PLAYER: 1,
                        TRUSTED: 2,
                        ASSISTANT: 3,
                        GAMEMASTER: 4
                    }
                }

                try {
                    createSettingsMenu({
                        MODULE_ID: "transformations",
                        game: {
                            user: {
                                role: 3,
                                isGM: true
                            },
                            settings: {
                                register(moduleId, key, options)
                                {
                                    registrations.push({
                                        moduleId,
                                        key,
                                        options
                                    })
                                },
                                registerMenu(moduleId, key, options)
                                {
                                    menus.push({
                                        moduleId,
                                        key,
                                        options
                                    })
                                }
                            }
                        },
                        TransformationsDebugApplication: class {}
                    })
                } finally {
                    globalThis.CONST = originalConst
                }

                const loggerSetting = registrations.find(entry =>
                    entry.key === "loggerLevel"
                )
                const downgradeSetting = registrations.find(entry =>
                    entry.key === "downgradeTransformationAllowedRoles"
                )
                const changeSetting = registrations.find(entry =>
                    entry.key === "changeTransformationAllowedRoles"
                )

                expect(loggerSetting?.options?.config).to.equal(false)
                expect(downgradeSetting?.options?.config).to.equal(false)
                expect(changeSetting?.options?.config).to.equal(false)
                expect(menus.some(menu => menu.key === "debugMenu"))
                .to.equal(false)
            })
        })
    }
)
