import { createItemRepository } from "../../infrastructure/foundry/itemRepository.js"

function createLogger()
{
    return {
        debug() {},
        warn() {},
        trace() {}
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

function createDocumentCollection()
{
    const documents = []
    documents.get = function get(id)
    {
        return this.find(item => item.id === id) ?? null
    }
    return documents
}

function createActor({
    con = 12
} = {})
{
    let nextItemId = 1
    let nextEffectId = 1
    const items = createDocumentCollection()
    const effects = createDocumentCollection()

    return {
        id: "actor-1",
        uuid: "Actor.actor-1",
        flags: {
            transformations: {
                type: "fey",
                stage: 2
            }
        },
        system: {
            abilities: {
                str: { value: 10 },
                dex: { value: 10 },
                con: { value: con },
                int: { value: 10 },
                wis: { value: 10 },
                cha: { value: 10 }
            }
        },
        items,
        effects,
        async createEmbeddedDocuments(type, entries)
        {
            const created = entries.map(entry =>
                type === "ActiveEffect"
                    ? createEmbeddedEffect(this, entry, `effect-${nextEffectId++}`)
                    : createEmbeddedItem(this, entry, `item-${nextItemId++}`)
            )

            if (type === "ActiveEffect") {
                this.effects.push(...created)
                return created
            }

            this.items.push(...created)
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
}

function createEmbeddedEffect(actor, data, id)
{
    const effect = {
        ...deepClone(data),
        id,
        parent: actor,
        getFlag(scope, key)
        {
            const scopeValue = this.flags?.[scope]
            if (key === "") return scopeValue ?? null
            return scopeValue?.[key] ?? null
        },
        async update(updateData = {})
        {
            for (const [path, value] of Object.entries(updateData)) {
                setProperty(this, path, value)
            }

            return this
        }
    }

    effect.flags ??= {}

    return effect
}

function createEmbeddedItem(actor, data, id)
{
    const item = {
        ...deepClone(data),
        id,
        parent: actor,
        uuid: `${actor.uuid}.Item.${id}`,
        getFlag(scope, key)
        {
            const scopeValue = this.flags?.[scope]
            if (key === "") return scopeValue ?? null
            return scopeValue?.[key] ?? null
        },
        async update(updateData = {})
        {
            for (const [path, value] of Object.entries(updateData)) {
                setProperty(this, path, value)
            }

            return this
        }
    }

    item.flags ??= {}
    item.system ??= {}
    normalizeCreatedItem(item)

    return item
}

function normalizeCreatedItem(item)
{
    if (!item?.system) return item

    normalizeSpellPreparation(item.system)
    normalizeItemUses(item.system)

    return item
}

function normalizeSpellPreparation(system)
{
    if (system.method == null && system.prepared == null) return

    system.preparation ??= {}

    if (system.method != null && system.preparation.mode == null) {
        system.preparation.mode = system.method
    }

    if (system.prepared != null && system.preparation.prepared == null) {
        system.preparation.prepared = system.prepared
    }
}

function normalizeItemUses(system)
{
    if (!system.uses) return

    if (system.uses.value == null && system.uses.max != null) {
        system.uses.value = system.uses.max
    }
}

function deepClone(value)
{
    return value == null
        ? value
        : JSON.parse(JSON.stringify(value))
}

function setProperty(target, path, value)
{
    const parts = path.split(".")
    let current = target

    while (parts.length > 1) {
        const key = parts.shift()
        if (!(key in current) || current[key] == null) {
            current[key] = {}
        }
        current = current[key]
    }

    current[parts[0]] = value
    return target
}

function installFoundryUtils()
{
    const originalFoundry = globalThis.foundry

    globalThis.foundry = {
        ...(originalFoundry ?? {}),
        utils: {
            ...(originalFoundry?.utils ?? {}),
            deepClone,
            setProperty
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

function createRepository({
    chooseItemPoolResult = null
} = {})
{
    const calls = {
        chooseItemPool: []
    }

    const repository = createItemRepository({
        advancementChoiceHandler: {
            async choose() { return null },
            async chooseItemPool(data)
            {
                calls.chooseItemPool.push(data)
                return typeof chooseItemPoolResult === "function"
                    ? chooseItemPoolResult(data)
                    : chooseItemPoolResult
            }
        },
        advancementGrantResolver: {
            async resolve() { return false }
        },
        tracker: createTracker(),
        debouncedTracker: createDebouncedTracker(),
        getTransformationQueryService: () => null,
        logger: createLogger()
    })

    return {
        calls,
        repository
    }
}

quench.registerBatch(
    "transformations.infrastructure.itemRepository",
    ({describe, it, expect}) =>
    {
        describe("createItemRepository", function ()
        {
            it("applies spell advancement parameters to directly granted items", async function ()
            {
                const actor = createActor()
                const restoreFoundry = installFoundryUtils()
                const originalFromUuid = globalThis.fromUuid

                const grantedSpell = {
                    uuid: "Compendium.transformations.gh-transformations.Item.0vvQkWQdeXgf3QLR",
                    name: "Granted Spell",
                    type: "spell",
                    system: {
                        uses: {},
                        preparation: {},
                        activities: {
                            contents: [{
                                name: "Cast Granted Spell",
                                consumption: {
                                    targets: []
                                }
                            }]
                        }
                    }
                }

                globalThis.fromUuid = async uuid =>
                    uuid === grantedSpell.uuid
                        ? grantedSpell
                        : null

                const {repository} = createRepository()

                try {
                    const parentItem = await repository.createObjectOnActor(actor, {
                        uuid: "Item.parent-direct",
                        name: "Magic Tricks",
                        type: "feat",
                        system: {
                            advancement: [{
                                configuration: {
                                    items: [{
                                        uuid: grantedSpell.uuid
                                    }],
                                    spell: {
                                        ability: ["wis"],
                                        method: "atwill",
                                        uses: {
                                            max: "1",
                                            per: "day",
                                            requireSlot: false
                                        },
                                        prepared: 0
                                    },
                                    type: "spell"
                                }
                            }]
                        }
                    })

                    const createdSpell = actor.items.find(item =>
                        item.flags?.transformations?.sourceUuid === grantedSpell.uuid
                    )

                    expect(parentItem).to.exist
                    expect(createdSpell).to.exist
                    expect(createdSpell.flags.transformations.awardedByItem)
                    .to.equal(parentItem.uuid)
                    expect(createdSpell.system.ability).to.equal("wis")
                    expect(createdSpell.system.preparation.mode).to.equal("atwill")
                    expect(createdSpell.system.preparation.prepared).to.equal(0)
                    expect(createdSpell.system.uses.max).to.equal("1")
                    expect(createdSpell.system.uses.value).to.equal("1")
                    expect(createdSpell.system.uses.recovery).to.deep.equal([{
                        period: "day",
                        type: "recoverAll"
                    }])
                    expect(createdSpell.system.uses.requireSlot).to.equal(false)
                    expect(
                        createdSpell.system.activities.contents[0].consumption.targets
                    ).to.deep.equal([{
                        type: "itemUses",
                        value: "1"
                    }])
                } finally {
                    restoreFoundry()

                    if (originalFromUuid === undefined) {
                        delete globalThis.fromUuid
                    } else {
                        globalThis.fromUuid = originalFromUuid
                    }
                }
            })

            it("applies spell advancement parameters to item-pool selections", async function ()
            {
                const actor = createActor()
                const restoreFoundry = installFoundryUtils()
                const originalFromUuid = globalThis.fromUuid

                const firstSpell = {
                    uuid: "Compendium.transformations.gh-transformations.Item.0vvQkWQdeXgf3QLR",
                    name: "First Spell",
                    img: "first.png",
                    type: "spell",
                    system: {
                        description: {
                            value: "<p>First</p>"
                        },
                        uses: {},
                        preparation: {},
                        activities: {
                            contents: [{
                                name: "Cast First Spell",
                                consumption: {
                                    targets: []
                                }
                            }]
                        }
                    }
                }
                const secondSpell = {
                    uuid: "Compendium.transformations.gh-transformations.Item.jLTfPpvW44ig6wWI",
                    name: "Second Spell",
                    img: "second.png",
                    type: "spell",
                    system: {
                        description: {
                            value: "<p>Second</p>"
                        },
                        uses: {},
                        preparation: {},
                        activities: {
                            contents: [{
                                name: "Cast Second Spell",
                                consumption: {
                                    targets: []
                                }
                            }]
                        }
                    }
                }

                globalThis.fromUuid = async uuid =>
                {
                    switch (uuid) {
                        case firstSpell.uuid:
                            return firstSpell
                        case secondSpell.uuid:
                            return secondSpell
                        default:
                            return null
                    }
                }

                const {calls, repository} = createRepository({
                    chooseItemPoolResult: ({itemChoices}) =>
                        itemChoices.find(choice => choice.uuid === secondSpell.uuid)
                })

                try {
                    const parentItem = await repository.createObjectOnActor(actor, {
                        uuid: "Item.parent-pool",
                        name: "Greater Magic Tricks",
                        type: "feat",
                        system: {
                            advancement: [{
                                configuration: {
                                    allowDrops: false,
                                    choices: {
                                        0: {
                                            count: 1,
                                            replacement: false
                                        }
                                    },
                                    pool: [
                                        {uuid: firstSpell.uuid},
                                        {uuid: secondSpell.uuid}
                                    ],
                                    restriction: {
                                        list: [],
                                        level: "available"
                                    },
                                    spell: {
                                        ability: ["int"],
                                        method: "atwill",
                                        uses: {
                                            max: "1",
                                            per: "day",
                                            requireSlot: false
                                        },
                                        prepared: 0
                                    },
                                    type: "spell"
                                }
                            }]
                        }
                    })

                    const createdSpell = actor.items.find(item =>
                        item.flags?.transformations?.sourceUuid === secondSpell.uuid
                    )

                    expect(parentItem).to.exist
                    expect(calls.chooseItemPool).to.have.length(1)
                    expect(createdSpell).to.exist
                    expect(createdSpell.flags.transformations.awardedByItem)
                    .to.equal(parentItem.uuid)
                    expect(createdSpell.system.ability).to.equal("int")
                    expect(createdSpell.system.preparation.mode).to.equal("atwill")
                    expect(createdSpell.system.preparation.prepared).to.equal(0)
                    expect(createdSpell.system.uses.max).to.equal("1")
                    expect(createdSpell.system.uses.value).to.equal("1")
                    expect(createdSpell.system.uses.recovery).to.deep.equal([{
                        period: "day",
                        type: "recoverAll"
                    }])
                    expect(createdSpell.system.uses.requireSlot).to.equal(false)
                    expect(
                        createdSpell.system.activities.contents[0].consumption.targets
                    ).to.deep.equal([{
                        type: "itemUses",
                        value: "1"
                    }])
                } finally {
                    restoreFoundry()

                    if (originalFromUuid === undefined) {
                        delete globalThis.fromUuid
                    } else {
                        globalThis.fromUuid = originalFromUuid
                    }
                }
            })

            it("auto-applies the only remaining item-pool choice after filtering existing items", async function ()
            {
                const actor = createActor()
                const restoreFoundry = installFoundryUtils()
                const originalFromUuid = globalThis.fromUuid

                const firstSpell = {
                    uuid: "Compendium.transformations.gh-transformations.Item.0vvQkWQdeXgf3QLR",
                    name: "First Spell",
                    img: "first.png",
                    type: "spell",
                    system: {
                        description: {
                            value: "<p>First</p>"
                        },
                        uses: {},
                        preparation: {},
                        activities: {
                            contents: [{
                                name: "Cast First Spell",
                                consumption: {
                                    targets: []
                                }
                            }]
                        }
                    }
                }
                const secondSpell = {
                    uuid: "Compendium.transformations.gh-transformations.Item.jLTfPpvW44ig6wWI",
                    name: "Second Spell",
                    img: "second.png",
                    type: "spell",
                    system: {
                        description: {
                            value: "<p>Second</p>"
                        },
                        uses: {},
                        preparation: {},
                        activities: {
                            contents: [{
                                name: "Cast Second Spell",
                                consumption: {
                                    targets: []
                                }
                            }]
                        }
                    }
                }

                globalThis.fromUuid = async uuid =>
                {
                    switch (uuid) {
                        case firstSpell.uuid:
                            return firstSpell
                        case secondSpell.uuid:
                            return secondSpell
                        default:
                            return null
                    }
                }

                const {calls, repository} = createRepository({
                    chooseItemPoolResult: ({itemChoices}) => itemChoices[0]
                })

                try {
                    await repository.createObjectOnActor(actor, firstSpell, "", {
                        applyAdvancements: false
                    })

                    const parentItem = await repository.createObjectOnActor(actor, {
                        uuid: "Item.parent-filtered-pool",
                        name: "Filtered Magic Tricks",
                        type: "feat",
                        system: {
                            advancement: [{
                                configuration: {
                                    allowDrops: false,
                                    choices: {
                                        0: {
                                            count: 1,
                                            replacement: false
                                        }
                                    },
                                    pool: [
                                        {uuid: firstSpell.uuid},
                                        {uuid: secondSpell.uuid}
                                    ],
                                    restriction: {
                                        list: [],
                                        level: "available"
                                    },
                                    spell: {
                                        ability: ["int"],
                                        method: "atwill",
                                        uses: {
                                            max: "1",
                                            per: "day",
                                            requireSlot: false
                                        },
                                        prepared: 0
                                    },
                                    type: "spell"
                                }
                            }]
                        }
                    })

                    const createdSpell = actor.items.find(item =>
                        item.flags?.transformations?.sourceUuid === secondSpell.uuid
                    )

                    expect(parentItem).to.exist
                    expect(calls.chooseItemPool).to.have.length(0)
                    expect(createdSpell).to.exist
                    expect(createdSpell.flags.transformations.awardedByItem)
                    .to.equal(parentItem.uuid)
                } finally {
                    restoreFoundry()

                    if (originalFromUuid === undefined) {
                        delete globalThis.fromUuid
                    } else {
                        globalThis.fromUuid = originalFromUuid
                    }
                }
            })

            it("applies fixed ability score advancements as hidden removable effects", async function ()
            {
                const actor = createActor({
                    con: 12
                })
                const restoreFoundry = installFoundryUtils()
                const {repository} = createRepository()

                try {
                    const parentItem = await repository.createObjectOnActor(actor, {
                        uuid: "Item.parent-fixed-asi",
                        name: "Constitutional Mutation",
                        type: "feat",
                        img: "mutation.png",
                        system: {
                            advancement: [{
                                configuration: {
                                    cap: 1,
                                    fixed: {
                                        str: 0,
                                        dex: 0,
                                        con: 1,
                                        int: 0,
                                        wis: 0,
                                        cha: 0
                                    },
                                    locked: [
                                        "str",
                                        "dex",
                                        "con",
                                        "int",
                                        "wis",
                                        "cha"
                                    ],
                                    points: 0,
                                    recommendation: null,
                                    max: null
                                }
                            }]
                        }
                    })

                    expect(parentItem).to.exist
                    expect(actor.effects).to.have.length(1)
                    expect(actor.effects[0]).to.deep.include({
                        name: "Ability Score Increase: Constitution",
                        description: "Constitution +1 to 13 (maximum 20).",
                        icon: "modules/transformations/icons/abilities/Constitution.svg",
                        origin: parentItem.uuid
                    })
                    expect(actor.effects[0].changes).to.deep.equal([{
                        key: "system.abilities.con.value",
                        mode: globalThis.CONST?.ACTIVE_EFFECT_MODES?.UPGRADE ?? 4,
                        value: 13
                    }])
                    expect(actor.effects[0].flags).to.deep.equal({
                        dnd5e: {
                            hidden: true
                        },
                        ddbimporter: {
                            ignoreItemImport: true
                        },
                        transformations: {
                            addedByTransformation: true,
                            source: "transformation",
                            context: {},
                            advancementType: "abilityScore",
                            advancementAbilityScores: [{
                                ability: "con",
                                delta: 1,
                                targetValue: 13,
                                maximumValue: 20
                            }]
                        }
                    })
                } finally {
                    restoreFoundry()
                }
            })

            it("caps fixed ability score advancements at 20 and removes them with the parent item", async function ()
            {
                const actor = createActor({
                    con: 20
                })
                const restoreFoundry = installFoundryUtils()
                const {repository} = createRepository()

                try {
                    await repository.createObjectOnActor(actor, {
                        uuid: "Item.parent-capped-asi",
                        name: "Perfect Constitution",
                        type: "feat",
                        system: {
                            advancement: [{
                                configuration: {
                                    cap: 1,
                                    fixed: {
                                        str: 0,
                                        dex: 0,
                                        con: 1,
                                        int: 0,
                                        wis: 0,
                                        cha: 0
                                    },
                                    locked: [
                                        "str",
                                        "dex",
                                        "con",
                                        "int",
                                        "wis",
                                        "cha"
                                    ],
                                    points: 0,
                                    recommendation: null,
                                    max: null
                                }
                            }]
                        }
                    })

                    expect(actor.effects).to.have.length(1)
                    expect(actor.effects[0].changes).to.deep.equal([{
                        key: "system.abilities.con.value",
                        mode: globalThis.CONST?.ACTIVE_EFFECT_MODES?.UPGRADE ?? 4,
                        value: 20
                    }])

                    const removed = await repository.removeBySourceUuid(
                        actor,
                        "Item.parent-capped-asi"
                    )

                    expect(removed).to.equal(1)
                    expect(actor.items).to.have.length(0)
                    expect(actor.effects).to.have.length(0)
                } finally {
                    restoreFoundry()
                }
            })
        })
    }
)
