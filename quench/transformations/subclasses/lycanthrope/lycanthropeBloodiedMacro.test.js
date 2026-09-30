import { conditionsMet } from "../../../../domain/actions/conditionSchema.js"
import {
    LYCANTHROPE_FERAL_HYBRID_EFFECT_NAME,
    LYCANTHROPE_HYBRID_FORM_ITEM_UUIDS,
    LYCANTHROPE_TRANSFORM_ACTIVITY_NAME,
    LYCANTHROPE_ULTIMATE_PREDATOR_EFFECT_NAME
} from "../../../../domain/transformation/subclasses/lycanthrope/constants.js"
import { Lycanthrope } from "../../../../domain/transformation/subclasses/lycanthrope/Lycanthrope.js"
import {
    createLycanthropeMacroHandlers,
    findHybridFormActivities
} from "../../../../domain/transformation/subclasses/lycanthrope/macros/handlers.js"
import { lycanthropeMacros } from "../../../../domain/transformation/subclasses/lycanthrope/macros.js"
import { onBloodied } from "../../../../domain/transformation/subclasses/lycanthrope/triggers/onBloodied.js"

const WOLF_FORM_UUID = "Compendium.transformations.gh-transformations.Item.Dhdr9DZHA9qjXhYo"

quench.registerBatch(
    "transformations.lycanthrope.bloodiedMacro",
    ({ describe, it, expect }) =>
    {
        describe("Lycanthrope bloodied macro handlers", function()
        {
            function createTracker()
            {
                return {
                    track: async tracked => await tracked
                }
            }

            function createActiveEffectRepository(existingNames = [])
            {
                const calls = {
                    created: [],
                    removed: []
                }
                const names = [...existingNames]

                return {
                    calls,
                    hasByName: (_actor, name) => names.includes(name),
                    getIdsByName: (_actor, name) =>
                        names.filter(n => n === name).map((_n, i) => `${name}-${i}`),
                    removeByIds: async (_actor, ids) =>
                    {
                        calls.removed.push(...ids)
                    },
                    create: async data =>
                    {
                        calls.created.push(data)
                        names.push(data.name)
                        return data
                    }
                }
            }

            function createWolfFormItem(useLog)
            {
                return {
                    name: "Hybrid Wolf Form",
                    img: "wolf.png",
                    flags: {
                        transformations: {
                            sourceUuid: WOLF_FORM_UUID
                        }
                    },
                    system: {
                        activities: [
                            {
                                id: "EBs1Nv4lQU74ZGqu",
                                type: "transform",
                                name: "Kindred Form: Wolf",
                                use: async () => useLog.push("kindred")
                            },
                            {
                                id: "fNITPIQWquZlNt8o",
                                type: "transform",
                                name: "",
                                use: async () => useLog.push("transform")
                            },
                            {
                                id: "1NQ5cRcOCj5yWTmh",
                                type: "utility",
                                name: "Apply Hybrid Wolf effect",
                                effects: [{ _id: "BoUKEIJSakUfrVZV" }],
                                use: async () => useLog.push("effect")
                            }
                        ]
                    }
                }
            }

            it("applies the hybrid effect activity, the feral marker and then the transform activity", async function()
            {
                const useLog = []
                const actor = { name: "Test Lycanthrope", flags: {} }
                const activeEffectRepository = createActiveEffectRepository()
                const handlers = createLycanthropeMacroHandlers({
                    activeEffectRepository,
                    itemRepository: {
                        findEmbeddedByUuidFlag: (_actor, uuid) =>
                            uuid === WOLF_FORM_UUID ? createWolfFormItem(useLog) : null
                    },
                    tracker: createTracker(),
                    logger: console
                })

                const result =
                    await handlers[lycanthropeMacros.triggerBloodiedHybridTransform]({
                        actor,
                        trigger: "bloodied"
                    })

                expect(result).to.equal(true)
                expect(useLog).to.deep.equal(["effect", "transform"])
                expect(activeEffectRepository.calls.created.length).to.equal(1)
                expect(activeEffectRepository.calls.created[0].name)
                    .to.equal(LYCANTHROPE_FERAL_HYBRID_EFFECT_NAME)
            })

            function createRoutingFixture({ allowPolymorphing })
            {
                const useLog = []
                const routed = []
                const player = { id: "player", active: true, isGM: false, can: () => true }
                const gm = { id: "gm", active: true, isGM: true, can: () => true }
                const userList = [gm, player]
                const actor = {
                    name: "Test Lycanthrope",
                    uuid: "Actor.lycan",
                    flags: {},
                    testUserPermission: user => user === player
                }
                const item = createWolfFormItem(useLog)
                for (const activity of item.system.activities) {
                    activity.uuid = `Actor.lycan.Item.wolf.Activity.${activity.id}`
                }
                const handlers = createLycanthropeMacroHandlers({
                    activeEffectRepository: createActiveEffectRepository(),
                    itemRepository: {
                        findEmbeddedByUuidFlag: (_actor, uuid) =>
                            uuid === WOLF_FORM_UUID ? item : null
                    },
                    useActivityAsUser: async data => routed.push(data),
                    getGame: () => ({
                        user: gm,
                        users: {
                            get: id => userList.find(user => user.id === id),
                            find: predicate => userList.find(predicate)
                        },
                        settings: {
                            get: (scope, key) =>
                                scope === "dnd5e" && key === "allowPolymorphing" ? allowPolymorphing : null
                        }
                    }),
                    tracker: createTracker(),
                    logger: console
                })

                return { actor, handlers, routed, useLog }
            }

            it("uses the hybrid form activities on the triggering player's client when run on the GM", async function()
            {
                const { actor, handlers, routed, useLog } = createRoutingFixture({ allowPolymorphing: true })

                const result =
                    await handlers[lycanthropeMacros.triggerBloodiedHybridTransform]({
                        actor,
                        trigger: "on",
                        triggeringUserId: "player"
                    })

                expect(result).to.equal(true)
                expect(useLog).to.deep.equal([])
                expect(routed.map(data => data.activityUuid)).to.deep.equal([
                    "Actor.lycan.Item.wolf.Activity.1NQ5cRcOCj5yWTmh",
                    "Actor.lycan.Item.wolf.Activity.fNITPIQWquZlNt8o"
                ])
                expect(routed.every(data => data.userId === "player")).to.equal(true)
            })

            it("keeps the transform activity on the GM when players may not transform", async function()
            {
                const { actor, handlers, routed, useLog } = createRoutingFixture({ allowPolymorphing: false })

                const result =
                    await handlers[lycanthropeMacros.triggerBloodiedHybridTransform]({
                        actor,
                        trigger: "on",
                        triggeringUserId: "player"
                    })

                expect(result).to.equal(true)
                expect(routed.map(data => data.activityUuid)).to.deep.equal([
                    "Actor.lycan.Item.wolf.Activity.1NQ5cRcOCj5yWTmh"
                ])
                expect(useLog).to.deep.equal(["transform"])
            })

            it("falls back to the transform activity by name for items without known activity ids", async function()
            {
                const activityCalls = []
                const firstMatchedUuid = LYCANTHROPE_HYBRID_FORM_ITEM_UUIDS[1]
                const actor = { name: "Test Lycanthrope" }
                const itemRepository = {
                    findEmbeddedByUuidFlag: (_actor, uuid) =>
                    {
                        if (uuid !== firstMatchedUuid) return null

                        return {
                            name: "Hybrid Form",
                            system: {
                                activities: [
                                    {
                                        name: "Not Transform",
                                        use: async () => false
                                    },
                                    {
                                        name: LYCANTHROPE_TRANSFORM_ACTIVITY_NAME,
                                        use: async options =>
                                        {
                                            activityCalls.push(options)
                                            return true
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }

                const handlers = createLycanthropeMacroHandlers({
                    itemRepository,
                    tracker: createTracker(),
                    logger: console
                })

                const result =
                    await handlers[lycanthropeMacros.triggerBloodiedHybridTransform]({
                        actor
                    })

                expect(result).to.equal(true)
                expect(activityCalls.length).to.equal(1)
                expect(activityCalls[0]).to.deep.equal({ actor })
            })

            it("does nothing when the Ultimate Predator effect is removed (DAE off)", async function()
            {
                const useLog = []
                const handlers = createLycanthropeMacroHandlers({
                    activeEffectRepository: createActiveEffectRepository(),
                    itemRepository: {
                        findEmbeddedByUuidFlag: () => createWolfFormItem(useLog)
                    },
                    tracker: createTracker(),
                    logger: console
                })

                const result =
                    await handlers[lycanthropeMacros.triggerBloodiedHybridTransform]({
                        actor: { name: "Test Lycanthrope", flags: {} },
                        trigger: "off"
                    })

                expect(result).to.equal(false)
                expect(useLog).to.deep.equal([])
            })

            it("removes the Ultimate Predator trigger effect when fired by DAE on", async function()
            {
                const useLog = []
                const activeEffectRepository =
                    createActiveEffectRepository([LYCANTHROPE_ULTIMATE_PREDATOR_EFFECT_NAME])
                const handlers = createLycanthropeMacroHandlers({
                    activeEffectRepository,
                    itemRepository: {
                        findEmbeddedByUuidFlag: () => createWolfFormItem(useLog)
                    },
                    tracker: createTracker(),
                    logger: console
                })

                const result =
                    await handlers[lycanthropeMacros.triggerBloodiedHybridTransform]({
                        actor: { name: "Test Lycanthrope", flags: {} },
                        trigger: "on"
                    })

                expect(result).to.equal(true)
                expect(activeEffectRepository.calls.removed.length).to.equal(1)
                expect(useLog).to.deep.equal(["effect", "transform"])
            })

            it("only turns feral when the actor is already in hybrid form", async function()
            {
                const useLog = []
                const activeEffectRepository = createActiveEffectRepository()
                const handlers = createLycanthropeMacroHandlers({
                    activeEffectRepository,
                    itemRepository: {
                        findEmbeddedByUuidFlag: () => createWolfFormItem(useLog)
                    },
                    tracker: createTracker(),
                    logger: console
                })

                const result =
                    await handlers[lycanthropeMacros.triggerBloodiedHybridTransform]({
                        actor: {
                            name: "Hybrid Lycanthrope",
                            flags: { transformations: { lycanthrope: { hybridForm: 1 } } }
                        },
                        trigger: "bloodied"
                    })

                expect(result).to.equal(true)
                expect(useLog).to.deep.equal([])
                expect(activeEffectRepository.calls.created.map(e => e.name))
                    .to.deep.equal([LYCANTHROPE_FERAL_HYBRID_EFFECT_NAME])
            })

            it("returns false when the actor has no matching hybrid form item", async function()
            {
                const handlers = createLycanthropeMacroHandlers({
                    itemRepository: {
                        findEmbeddedByUuidFlag: () => null
                    },
                    tracker: createTracker(),
                    logger: console
                })

                const result =
                    await handlers[lycanthropeMacros.triggerBloodiedHybridTransform]({
                        actor: { name: "No Form Actor" }
                    })

                expect(result).to.equal(false)
            })

            it("returns false when the hybrid form item has no Transform activity", async function()
            {
                const handlers = createLycanthropeMacroHandlers({
                    itemRepository: {
                        findEmbeddedByUuidFlag: () => ({
                            name: "Broken Hybrid Form",
                            system: {
                                activities: [
                                    {
                                        name: "Something Else",
                                        use: async () => true
                                    }
                                ]
                            }
                        })
                    },
                    tracker: createTracker(),
                    logger: console
                })

                const result =
                    await handlers[lycanthropeMacros.triggerBloodiedHybridTransform]({
                        actor: { name: "Broken Actor" }
                    })

                expect(result).to.equal(false)
            })

            it("finds the transform and hybrid effect activities on the real pack hybrid form items", async function()
            {
                for (const uuid of LYCANTHROPE_HYBRID_FORM_ITEM_UUIDS) {
                    const item = await fromUuid(uuid)
                    expect(item, uuid).to.exist

                    const { transformActivity, effectActivity } = findHybridFormActivities(item)

                    expect(transformActivity?.type, uuid).to.equal("transform")
                    expect(String(transformActivity?.name ?? "")).to.not.match(/^Kindred Form/)
                    expect(effectActivity?.type, uuid).to.equal("utility")
                    expect(effectActivity?.effects?.length ?? 0, uuid).to.be.greaterThan(0)
                }
            })
        })

        describe("Lycanthrope bloodied trigger", function()
        {
            const actionGroup = onBloodied.actionGroups[0]
            const saveAction = actionGroup.actions.find(action => action.type === "SAVE")
            const macroAction = actionGroup.actions.find(action => action.type === "MACRO")

            it("only forces the hybrid form when the Wisdom save fails", function()
            {
                expect(macroAction.when?.saveFailed).to.equal(saveAction.data.key)

                const failed = conditionsMet(null, macroAction.when, {
                    saves: { [saveAction.data.key]: { success: false } }
                })
                const succeeded = conditionsMet(null, macroAction.when, {
                    saves: { [saveAction.data.key]: { success: true } }
                })

                expect(failed).to.equal(true)
                expect(succeeded).to.equal(false)
            })
        })

        describe("Lycanthrope Hunter's Focus", function()
        {
            function createAttacker({ hybridForm = 1 } = {})
            {
                return {
                    uuid: "Actor.attacker0000001",
                    flags: { transformations: { lycanthrope: { hybridForm } } }
                }
            }

            function createMarkedTarget(origin)
            {
                return {
                    actor: {
                        effects: [
                            {
                                name: "Hunter’s Mark",
                                disabled: false,
                                origin,
                                changes: [
                                    {
                                        key: "flags.transformations.lycanthrope.huntersMark",
                                        value: "1"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }

            const meleeActivity = { type: "attack", attack: { type: { value: "melee" } } }

            it("adds 1d6 to melee damage against prey marked by the attacker in hybrid form", function()
            {
                const attacker = createAttacker()
                const rolls = [{ parts: ["1d8", "@mod"], options: { types: ["slashing"] } }]

                Lycanthrope.onPreRollDamage({
                    actor: attacker,
                    activity: meleeActivity,
                    rolls,
                    workflow: {
                        hitTargets: new Set([
                            createMarkedTarget(`${attacker.uuid}.Item.huntersFocus0001`)
                        ])
                    }
                })

                expect(rolls[0].parts).to.deep.equal(["1d8", "@mod", "1d6"])
            })

            it("ignores prey marked by another creature", function()
            {
                const rolls = [{ parts: ["1d8"] }]

                Lycanthrope.onPreRollDamage({
                    actor: createAttacker(),
                    activity: meleeActivity,
                    rolls,
                    workflow: {
                        hitTargets: new Set([
                            createMarkedTarget("Actor.someoneElse00001.Item.huntersFocus0001")
                        ])
                    }
                })

                expect(rolls[0].parts).to.deep.equal(["1d8"])
            })

            it("accepts prey marked by the attacker's original actor before it transformed", function()
            {
                const attacker = {
                    uuid: "Actor.hybridActor000001",
                    isToken: false,
                    flags: {
                        dnd5e: {
                            originalActor: "originalActor0001",
                            previousActorIds: ["originalActor0001", "hybridActor000000"]
                        },
                        transformations: { lycanthrope: { hybridForm: 1 } }
                    }
                }
                const rolls = [{ parts: ["1d8"] }]

                Lycanthrope.onPreRollDamage({
                    actor: attacker,
                    activity: meleeActivity,
                    rolls,
                    workflow: {
                        hitTargets: new Set([
                            createMarkedTarget("Actor.hybridActor000000.Item.huntersFocus0001")
                        ])
                    }
                })

                expect(rolls[0].parts).to.deep.equal(["1d8", "1d6"])
            })

            it("ignores attacks outside hybrid form and ranged attacks", function()
            {
                const attacker = createAttacker({ hybridForm: 0 })
                const rolls = [{ parts: ["1d8"] }]

                Lycanthrope.onPreRollDamage({
                    actor: attacker,
                    activity: meleeActivity,
                    rolls,
                    workflow: {
                        hitTargets: new Set([
                            createMarkedTarget(`${attacker.uuid}.Item.huntersFocus0001`)
                        ])
                    }
                })

                const hybridAttacker = createAttacker()
                Lycanthrope.onPreRollDamage({
                    actor: hybridAttacker,
                    activity: { type: "attack", attack: { type: { value: "ranged" } } },
                    rolls,
                    workflow: {
                        hitTargets: new Set([
                            createMarkedTarget(`${hybridAttacker.uuid}.Item.huntersFocus0001`)
                        ])
                    }
                })

                expect(rolls[0].parts).to.deep.equal(["1d8"])
            })

            it("no longer grants advantage on attack rolls against marked targets", async function()
            {
                const rollConfig = { disadvantage: true }

                await Lycanthrope.onPreRollAttack({ rollConfig, actor: createAttacker() })

                expect(rollConfig.advantage).to.not.equal(true)
                expect(rollConfig.disadvantage).to.equal(true)
            })
        })
    }
)
