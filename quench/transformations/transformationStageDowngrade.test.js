import { createActiveEffectRepository } from "../../infrastructure/foundry/activeEffectsRepository.js"
import { createActorRepository } from "../../infrastructure/foundry/actorRepository.js"
import { createItemRepository } from "../../infrastructure/foundry/itemRepository.js"
import { createTransformationMutationGateway } from "../../infrastructure/foundry/TransformationMutationGateway.js"
import { createLocalTransformationMutationAdapter } from "../../infrastructure/mutations/createLocalTransformationMutationAdapter.js"
import { createTransformationService } from "../../services/transformations/createTransformationServices.js"

function createLogger()
{
    return {
        debug() {},
        warn() {},
        trace() {},
        error() {}
    }
}

function createTracker()
{
    return {
        async track(promise)
        {
            return await promise
        },
        async whenIdle() {}
    }
}

function createDebouncedTracker()
{
    return {
        pulse() {}
    }
}

function deepClone(value)
{
    return value == null
        ? value
        : JSON.parse(JSON.stringify(value))
}

function createDocumentCollection(entries = [])
{
    const documents = [...entries]
    documents.get = function get(id)
    {
        return this.find(document => document.id === id) ?? null
    }
    return documents
}

function createActor({
    transformationId = "test-transformation",
    stage = 2,
    stageChoices = {
        "test-transformation": {
            1: "stage-1-choice",
            2: "stage-2-choice"
        }
    },
    scopedFlags = {
        maximumDaysPerFeed: 4
    }
} = {})
{
    let nextItemId = 100
    let nextEffectId = 100
    const actor = {
        id: "actor-1",
        uuid: "Actor.actor-1",
        type: "character",
        flags: {
            transformations: {
                type: transformationId,
                stage,
                finishedStage: stage,
                stageChoices,
                [transformationId]: scopedFlags
            }
        },
        items: createDocumentCollection(),
        effects: createDocumentCollection(),
        getFlag(scope, key)
        {
            const scopeValue = this.flags?.[scope]
            if (!key) return scopeValue ?? null

            return key.split(".").reduce(
                (current, part) => current?.[part],
                scopeValue
            ) ?? null
        },
        async setFlag(scope, key, value)
        {
            this.flags[scope] ??= {}
            setProperty(this.flags[scope], key, value)
            return value
        },
        async unsetFlag(scope, key)
        {
            if (this.flags?.[scope]) {
                delete this.flags[scope][key]
            }
        },
        async update(updateData = {})
        {
            for (const [path, value] of Object.entries(updateData)) {
                applyUpdatePath(this, path, value)
            }

            return this
        },
        async createEmbeddedDocuments(type, entries)
        {
            const created = entries.map(entry =>
                type === "ActiveEffect"
                    ? createEffect(this, entry, `effect-${nextEffectId++}`)
                    : createItem(this, entry, `item-${nextItemId++}`)
            )

            if (type === "ActiveEffect") {
                this.effects.push(...created)
            } else {
                this.items.push(...created)
            }

            return created
        },
        async deleteEmbeddedDocuments(type, ids)
        {
            const idSet = new Set(ids)
            const collection = type === "ActiveEffect"
                ? this.effects
                : this.items

            for (let index = collection.length - 1; index >= 0; index -= 1) {
                if (idSet.has(collection[index]?.id)) {
                    collection.splice(index, 1)
                }
            }
        }
    }

    return actor
}

function createItem(actor, data, id)
{
    const item = {
        ...deepClone(data),
        id,
        parent: actor,
        uuid: data.uuid?.startsWith(actor.uuid)
            ? data.uuid
            : `${actor.uuid}.Item.${id}`,
        getFlag(scope, key)
        {
            const scopeValue = this.flags?.[scope]
            if (key === "") return scopeValue ?? null
            return key.split(".").reduce(
                (current, part) => current?.[part],
                scopeValue
            ) ?? null
        },
        async update(updateData = {})
        {
            for (const [path, value] of Object.entries(updateData)) {
                applyUpdatePath(this, path, value)
            }

            return this
        }
    }

    item.flags ??= {}
    item.system ??= {}

    return item
}

function createEffect(actor, data, id)
{
    return {
        ...deepClone(data),
        id,
        parent: actor,
        getFlag(scope, key)
        {
            const scopeValue = this.flags?.[scope]
            if (key === "") return scopeValue ?? null
            return scopeValue?.[key] ?? null
        }
    }
}

function transformationItem(actor, {
    id,
    sourceUuid,
    stage,
    definitionId = "test-transformation",
    grantType = "stage",
    replacesUuid = null,
    awardedByItem = ""
})
{
    return createItem(actor, {
        id,
        uuid: `${actor.uuid}.Item.${id}`,
        name: sourceUuid,
        type: "feat",
        flags: {
            transformations: {
                sourceUuid,
                definitionId,
                stage,
                addedByTransformation: true,
                awardedByItem,
                grantedBy: {
                    transformationId: definitionId,
                    stage,
                    sourceUuid,
                    grantType,
                    replacesUuid,
                    awardedByItem
                }
            }
        }
    }, id)
}

function transformationEffect(actor, {
    id,
    stage,
    origin = "",
    definitionId = "test-transformation",
    grantType = "stage"
})
{
    return createEffect(actor, {
        id,
        name: id,
        origin,
        flags: {
            transformations: {
                definitionId,
                stage,
                addedByTransformation: true,
                grantedBy: {
                    transformationId: definitionId,
                    stage,
                    sourceUuid: origin,
                    grantType
                }
            }
        }
    }, id)
}

function unrelatedItem(actor, id)
{
    return createItem(actor, {
        id,
        name: id,
        type: "feat",
        flags: {}
    }, id)
}

function unrelatedEffect(actor, id)
{
    return createEffect(actor, {
        id,
        name: id,
        flags: {}
    }, id)
}

function createDefinition()
{
    return {
        id: "test-transformation",
        stages: {
            1: {
                stage: 1,
                grants: {
                    items: [
                        {uuid: "stage-1-item"}
                    ],
                    actor: {
                        flags: {
                            maximumDaysPerFeed: 7
                        }
                    }
                },
                choices: {
                    items: [
                        {uuid: "stage-1-choice"}
                    ]
                }
            },
            2: {
                stage: 2,
                grants: {
                    items: [
                        {uuid: "stage-2-item"}
                    ],
                    actor: {
                        flags: {
                            maximumDaysPerFeed: 4
                        }
                    }
                },
                choices: {
                    items: [
                        {uuid: "stage-2-choice"}
                    ]
                }
            },
            3: {
                stage: 3,
                grants: {
                    items: [
                        {
                            uuid: "stage-3-replacement",
                            replaces: {
                                uuid: "stage-1-item"
                            }
                        }
                    ]
                }
            }
        }
    }
}

function createRepositories(actor, definition, {
    compendiumDocuments = {}
} = {})
{
    const logger = createLogger()
    const tracker = createTracker()
    const debouncedTracker = createDebouncedTracker()
    const transformationQueryService = {
        async getForActor()
        {
            return {definition}
        }
    }

    const activeEffectRepository = createActiveEffectRepository({
        tracker,
        debouncedTracker,
        logger
    })
    const itemRepository = createItemRepository({
        advancementChoiceHandler: {
            async choose() { return null },
            async chooseAbilityScoreAdvancement() { return true },
            async chooseItemPool() { return null }
        },
        advancementGrantResolver: {
            async resolve() { return true }
        },
        tracker,
        debouncedTracker,
        getTransformationQueryService: () => transformationQueryService,
        logger
    })
    const actorRepository = createActorRepository({
        tracker,
        debouncedTracker,
        itemRepository,
        getGame: () => ({
            actors: {
                get(actorId)
                {
                    return actorId === actor.id ? actor : null
                }
            }
        }),
        logger
    })

    const adapter = createLocalTransformationMutationAdapter({
        tracker,
        actorRepository,
        getTransformationQueryService: () => transformationQueryService,
        itemRepository,
        creatureTypeService: {
            async restoreBaseCreatureType() {},
            async applyCreatureSubType() {}
        },
        compendiumRepository: {
            async getDocumentByUuid(uuid)
            {
                return compendiumDocuments[uuid] ?? null
            }
        },
        stageGrantResolver: {
            resolve()
            {
                return {
                    items: [],
                    creatureSubType: null,
                    transformationFlags: null
                }
            }
        },
        actionExecutor: {
            async execute() {}
        },
        activeEffectRepository,
        logger
    })

    return {
        actorRepository,
        itemRepository,
        activeEffectRepository,
        adapter
    }
}

function installFoundryUtils()
{
    const originalFoundry = globalThis.foundry

    globalThis.foundry = {
        ...(originalFoundry ?? {}),
        utils: {
            ...(originalFoundry?.utils ?? {}),
            deepClone,
            setProperty,
            mergeObject(target, source)
            {
                return mergeObject(target, source)
            }
        }
    }

    return () =>
    {
        if (originalFoundry === undefined) {
            delete globalThis.foundry
            return
        }

        globalThis.foundry = originalFoundry
    }
}

function setProperty(target, path, value)
{
    const parts = path.split(".")
    let current = target

    while (parts.length > 1) {
        const key = parts.shift()
        current[key] ??= {}
        current = current[key]
    }

    current[parts[0]] = value
    return target
}

function applyUpdatePath(target, path, value)
{
    const parts = path.split(".")
    const unsetIndex = parts.findIndex(part => part.startsWith("-="))

    if (unsetIndex >= 0) {
        const key = parts[unsetIndex].slice(2)
        const parent = parts
            .slice(0, unsetIndex)
            .reduce((current, part) => current?.[part], target)

        if (parent && key) {
            delete parent[key]
        }
        return
    }

    setProperty(target, path, value)
}

function mergeObject(target, source)
{
    const result = deepClone(target ?? {})

    for (const [key, value] of Object.entries(source ?? {})) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            result[key] = mergeObject(result[key], value)
        } else {
            result[key] = value
        }
    }

    return result
}

quench.registerBatch(
    "transformations.stageDowngrade",
    ({describe, it, expect}) =>
    {
        describe("downgradeTransformationStage", function()
        {
            it("downgrades stage 2 to 1 and removes only stage 2 grants", async function()
            {
                const restoreFoundry = installFoundryUtils()
                const actor = createActor()
                const definition = createDefinition()
                const stage2Item = transformationItem(actor, {
                    id: "stage-2-item-id",
                    sourceUuid: "stage-2-item",
                    stage: 2
                })
                const awardedByStage2Item = transformationItem(actor, {
                    id: "stage-2-awarded-id",
                    sourceUuid: "stage-2-awarded",
                    stage: 2,
                    awardedByItem: stage2Item.uuid
                })

                actor.items.push(
                    transformationItem(actor, {
                        id: "stage-1-item-id",
                        sourceUuid: "stage-1-item",
                        stage: 1
                    }),
                    stage2Item,
                    awardedByStage2Item,
                    transformationItem(actor, {
                        id: "other-transformation-item-id",
                        sourceUuid: "other-stage-2-item",
                        stage: 2,
                        definitionId: "other-transformation"
                    }),
                    unrelatedItem(actor, "unrelated-item-id")
                )
                actor.effects.push(
                    transformationEffect(actor, {
                        id: "stage-1-effect-id",
                        stage: 1
                    }),
                    transformationEffect(actor, {
                        id: "stage-2-effect-id",
                        stage: 2
                    }),
                    createEffect(actor, {
                        id: "stage-2-origin-effect-id",
                        name: "stage-2-origin-effect-id",
                        origin: stage2Item.uuid,
                        flags: {
                            transformations: {
                                addedByTransformation: true
                            }
                        }
                    }, "stage-2-origin-effect-id"),
                    transformationEffect(actor, {
                        id: "other-transformation-effect-id",
                        stage: 2,
                        definitionId: "other-transformation"
                    }),
                    unrelatedEffect(actor, "unrelated-effect-id")
                )

                const {adapter} = createRepositories(actor, definition)

                try {
                    const result = await adapter.downgradeStage({
                        actorId: actor.id,
                        transformationId: definition.id,
                        fromStage: 2,
                        toStage: 1
                    })

                    expect(result.ok).to.equal(true)
                    expect(actor.getFlag("transformations", "stage")).to.equal(1)
                    expect(actor.getFlag("transformations", "finishedStage")).to.equal(1)
                    expect(actor.items.some(item => item.id === "stage-2-item-id")).to.equal(false)
                    expect(actor.items.some(item => item.id === "stage-2-awarded-id")).to.equal(false)
                    expect(actor.effects.some(effect => effect.id === "stage-2-effect-id")).to.equal(false)
                    expect(actor.effects.some(effect => effect.id === "stage-2-origin-effect-id")).to.equal(false)
                    expect(actor.items.some(item => item.id === "stage-1-item-id")).to.equal(true)
                    expect(actor.effects.some(effect => effect.id === "stage-1-effect-id")).to.equal(true)
                    expect(actor.items.some(item => item.id === "other-transformation-item-id")).to.equal(true)
                    expect(actor.effects.some(effect => effect.id === "other-transformation-effect-id")).to.equal(true)
                    expect(actor.items.some(item => item.id === "unrelated-item-id")).to.equal(true)
                    expect(actor.effects.some(effect => effect.id === "unrelated-effect-id")).to.equal(true)
                    expect(
                        actor.getFlag("transformations", "stageChoices")
                        ?.[definition.id]
                        ?.[2]
                    ).to.equal(undefined)
                    expect(
                        actor.getFlag("transformations", "stageChoices")
                        ?.[definition.id]
                        ?.[1]
                    ).to.equal("stage-1-choice")
                    expect(
                        actor.getFlag("transformations", definition.id)
                        ?.maximumDaysPerFeed
                    ).to.equal(7)
                } finally {
                    restoreFoundry()
                }
            })

            it("restores a lower-stage item when downgrading a replacement stage", async function()
            {
                const restoreFoundry = installFoundryUtils()
                const actor = createActor({
                    stage: 3,
                    stageChoices: {
                        "test-transformation": {
                            1: "stage-1-choice"
                        }
                    },
                    scopedFlags: {}
                })
                const definition = createDefinition()

                actor.items.push(
                    transformationItem(actor, {
                        id: "stage-3-replacement-id",
                        sourceUuid: "stage-3-replacement",
                        stage: 3,
                        grantType: "replacement",
                        replacesUuid: "stage-1-item"
                    })
                )

                const {adapter} = createRepositories(actor, definition, {
                    compendiumDocuments: {
                        "stage-1-item": {
                            uuid: "stage-1-item",
                            name: "Stage 1 Item",
                            type: "feat",
                            system: {}
                        }
                    }
                })

                try {
                    await adapter.downgradeStage({
                        actorId: actor.id,
                        transformationId: definition.id,
                        fromStage: 3,
                        toStage: 2
                    })

                    expect(actor.items.some(item =>
                        item.flags?.transformations?.sourceUuid === "stage-3-replacement"
                    )).to.equal(false)
                    const restored = actor.items.find(item =>
                        item.flags?.transformations?.sourceUuid === "stage-1-item"
                    )
                    expect(restored).to.exist
                    expect(restored.flags.transformations.stage).to.equal(1)
                } finally {
                    restoreFoundry()
                }
            })

            it("does not duplicate preserved lower-stage awarded items when restoring their replaced parent", async function()
            {
                const restoreFoundry = installFoundryUtils()
                const actor = createActor({
                    stage: 3,
                    stageChoices: {
                        "test-transformation": {
                            1: "stage-1-choice"
                        }
                    },
                    scopedFlags: {}
                })
                const definition = createDefinition()

                const replacement = transformationItem(actor, {
                    id: "stage-3-replacement-id",
                    sourceUuid: "stage-3-replacement",
                    stage: 3,
                    grantType: "replacement",
                    replacesUuid: "stage-1-item"
                })
                replacement.flags.transformations.removeAwardedByReplacedItem =
                    false
                replacement.flags.transformations.grantedBy.removeAwardedByReplacedItem = false

                actor.items.push(
                    replacement,
                    transformationItem(actor, {
                        id: "stage-1-awarded-id",
                        sourceUuid: "stage-1-awarded",
                        stage: 1,
                        awardedByItem: "Actor.actor-1.Item.old-stage-1-item"
                    })
                )

                const {adapter} = createRepositories(actor, definition, {
                    compendiumDocuments: {
                        "stage-1-item": {
                            uuid: "stage-1-item",
                            name: "Stage 1 Item",
                            type: "feat",
                            system: {
                                advancement: [{
                                    configuration: {
                                        items: ["stage-1-awarded"]
                                    }
                                }]
                            }
                        }
                    }
                })

                try {
                    await adapter.downgradeStage({
                        actorId: actor.id,
                        transformationId: definition.id,
                        fromStage: 3,
                        toStage: 2
                    })

                    expect(actor.items.filter(item =>
                        item.flags?.transformations?.sourceUuid ===
                        "stage-1-awarded"
                    )).to.have.length(1)
                    expect(actor.items.some(item =>
                        item.flags?.transformations?.sourceUuid ===
                        "stage-1-item"
                    )).to.equal(true)
                } finally {
                    restoreFoundry()
                }
            })

            it("safely fails when the actor has no active transformation", async function()
            {
                const service = createTransformationService({
                    tracker: createTracker(),
                    mutationGateway: {
                        async downgradeStage()
                        {
                            throw new Error("downgradeStage should not be called")
                        }
                    },
                    transformationQueryService: {
                        async getForActor() { return null }
                    },
                    variableResolver: {},
                    stageChoiceResolver: {},
                    actorRepository: {
                        getActiveTransformationId() { return null },
                        getTransformationStage() { return 0 }
                    },
                    logger: createLogger()
                })

                const result = await service.downgradeTransformationStage({
                    id: "actor-1"
                })

                expect(result.ok).to.equal(false)
                expect(result.reason).to.equal("no-active-transformation")
            })

            it("safely fails when the actor is already at the minimum stage", async function()
            {
                const service = createTransformationService({
                    tracker: createTracker(),
                    mutationGateway: {
                        async downgradeStage()
                        {
                            throw new Error("downgradeStage should not be called")
                        }
                    },
                    transformationQueryService: {
                        async getForActor()
                        {
                            return {
                                definition: {
                                    id: "test-transformation"
                                }
                            }
                        }
                    },
                    variableResolver: {},
                    stageChoiceResolver: {},
                    actorRepository: {
                        getActiveTransformationId() { return "test-transformation" },
                        getTransformationStage() { return 1 }
                    },
                    logger: createLogger()
                })

                const result = await service.downgradeTransformationStage({
                    id: "actor-1"
                })

                expect(result.ok).to.equal(false)
                expect(result.reason).to.equal("minimum-stage")
            })

            it("uses the socket authority path when local mutation is not allowed", async function()
            {
                const calls = []
                const gateway = createTransformationMutationGateway({
                    tracker: createTracker(),
                    socketGateway: {
                        canMutateLocally() { return false },
                        isGMOnline() { return true },
                        isReady() { return true },
                        executeAsGM(action, payload)
                        {
                            calls.push({action, payload})
                            return {
                                ok: true
                            }
                        }
                    },
                    localMutationAdapter: {
                        async downgradeStage()
                        {
                            throw new Error("local downgrade should not run")
                        }
                    },
                    actionExecutor: {},
                    actionHandlers: {},
                    notifier: {
                        info() {}
                    },
                    logger: createLogger()
                })
                const payload = {
                    actorId: "actor-1",
                    transformationId: "test-transformation",
                    fromStage: 2,
                    toStage: 1
                }

                await gateway.downgradeStage(payload)

                expect(calls).to.deep.equal([{
                    action: "downgradeStage",
                    payload
                }])
            })
        })
    }
)
