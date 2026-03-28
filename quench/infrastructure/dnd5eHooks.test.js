import { registerDnd5eHooks } from "../../infrastructure/hooks/dnd5eHooks.js"

function createLogger()
{
    return {
        debug() {},
        warn() {}
    }
}

function createActor()
{
    return {
        id: "actor-1",
        getFlag() {
            return false
        }
    }
}

function createRoll({
    natural = 1,
    total = natural,
    isSuccess = false
} = {})
{
    return {
        total,
        isSuccess,
        dice: [
            {
                faces: 20,
                results: [
                    {active: false, result: 20},
                    {active: true, result: natural}
                ]
            }
        ]
    }
}

async function flushAsyncWork()
{
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
}

function createHookHarness()
{
    const originalHooks = globalThis.Hooks
    const callbacks = new Map()
    const calls = {
        onRoll: [],
        triggerRuntime: [],
        pulses: []
    }

    globalThis.Hooks = {
        on(name, callback)
        {
            callbacks.set(name, callback)
        }
    }

    const transformation = {
        TransformationClass: {
            onPreRollHitDie() {},
            async onPreRollSavingThrow() {},
            async onRoll(actor, roll)
            {
                calls.onRoll.push({actor, roll})
            }
        }
    }

    registerDnd5eHooks({
        transformationService: {},
        transformationRegistry: {
            getEntryForActor()
            {
                return transformation
            }
        },
        actorRepository: {},
        dialogFactory: {},
        triggerRuntime: {
            async run(name, actor, data)
            {
                calls.triggerRuntime.push({name, actor, data})
            }
        },
        onceService: {
            resetFlagsOnRest() {}
        },
        tracker: {
            track(promise)
            {
                return promise
            }
        },
        debouncedTracker: {
            pulse(name)
            {
                calls.pulses.push(name)
            }
        },
        ChatMessagePartInjector: {},
        RollService: {},
        logger: createLogger()
    })

    return {
        calls,
        callbacks,
        restore()
        {
            globalThis.Hooks = originalHooks
        }
    }
}

quench.registerBatch(
    "transformations.infrastructure.dnd5eHooks",
    ({ describe, it, expect }) =>
    {
        describe("registerDnd5eHooks", function()
        {
            it("captures all supported d20 roll results for transformation onRoll hooks", async function()
            {
                const actor = createActor()
                const harness = createHookHarness()

                try {
                    const scenarios = [
                        {
                            hookName: "dnd5e.rollAbilityCheck",
                            args: [
                                [createRoll({natural: 2, total: 7})],
                                {subject: actor, ability: "str"}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollSavingThrow",
                            args: [
                                [createRoll({natural: 3, total: 8, isSuccess: true})],
                                {subject: actor, ability: "wis"}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollSkill",
                            args: [
                                [createRoll({natural: 4, total: 9})],
                                {subject: actor, ability: "dex", skill: "ste"}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollToolCheck",
                            args: [
                                [createRoll({natural: 5, total: 10})],
                                {subject: actor, tool: "thief"}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollAttack",
                            args: [
                                [createRoll({natural: 6, total: 11})],
                                {subject: {item: {actor}}}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollConcentration",
                            args: [
                                [createRoll({natural: 7, total: 12})],
                                {subject: actor}
                            ]
                        },
                        {
                            hookName: "dnd5e.rollDeathSave",
                            args: [
                                [createRoll({natural: 8, total: 13})],
                                {subject: actor}
                            ]
                        },
                        {
                            hookName: "dnd5e.preRollInitiative",
                            args: [
                                actor,
                                createRoll({natural: 9, total: 14})
                            ]
                        }
                    ]

                    for (const scenario of scenarios) {
                        const callback = harness.callbacks.get(scenario.hookName)
                        expect(callback).to.be.a("function")
                        callback(...scenario.args)
                    }

                    await flushAsyncWork()

                    expect(
                        harness.calls.onRoll.map(({actor: rolledActor, roll}) => ({
                            actorId: rolledActor.id,
                            hookName: roll.hookName,
                            natural: roll.natural,
                            total: roll.total
                        }))
                    ).to.deep.equal([
                        {actorId: "actor-1", hookName: "dnd5e.rollAbilityCheck", natural: 2, total: 7},
                        {actorId: "actor-1", hookName: "dnd5e.rollSavingThrow", natural: 3, total: 8},
                        {actorId: "actor-1", hookName: "dnd5e.rollSkill", natural: 4, total: 9},
                        {actorId: "actor-1", hookName: "dnd5e.rollToolCheck", natural: 5, total: 10},
                        {actorId: "actor-1", hookName: "dnd5e.rollAttack", natural: 6, total: 11},
                        {actorId: "actor-1", hookName: "dnd5e.rollConcentration", natural: 7, total: 12},
                        {actorId: "actor-1", hookName: "dnd5e.rollDeathSave", natural: 8, total: 13},
                        {actorId: "actor-1", hookName: "dnd5e.preRollInitiative", natural: 9, total: 14}
                    ])
                } finally {
                    harness.restore()
                }
            })

            it("does not double-process the same skill roll across rollSkill hook aliases", async function()
            {
                const actor = createActor()
                const harness = createHookHarness()

                try {
                    const roll = createRoll({natural: 1, total: 5})
                    const context = {
                        subject: actor,
                        ability: "wis",
                        skill: "ins"
                    }

                    harness.callbacks.get("dnd5e.rollSkill")( [roll], context)
                    harness.callbacks.get("dnd5e.rollSkillV2")( [roll], context)

                    await flushAsyncWork()

                    expect(harness.calls.onRoll).to.have.length(1)
                    expect(
                        harness.calls.triggerRuntime.filter(call => call.name === "skillCheck")
                    ).to.have.length(1)
                } finally {
                    harness.restore()
                }
            })
        })
    }
)
