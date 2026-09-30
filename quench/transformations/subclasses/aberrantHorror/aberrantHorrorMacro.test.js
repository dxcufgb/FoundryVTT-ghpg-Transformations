import { createAberrantHorrorMacroHandlers } from "../../../../domain/transformation/subclasses/aberrantHorror/macros/handlers.js"

const POISONOUS_MUTATIONS_UUID = "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
const EFFICIENT_KILLER_UUID = "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
const NORMAL_LIMBS_UUID = "Compendium.transformations.gh-transformations.Item.6WiJSiBbhYTH80Da"
const PIERCING_LIMBS_UUID = "Compendium.transformations.gh-transformations.Item.naciCscJgzP21JiY"

quench.registerBatch(
    "transformations.aberrantHorror.macroHandlers",
    ({ describe, it, expect }) =>
    {
        describe("Aberrant Horror macro handlers", function ()
        {
            function createTracker()
            {
                return {
                    whenIdle: async () => true,
                    track: async tracked => await tracked
                }
            }

            function createPoisonousMutationsItem({ transfer = false, disabled = true } = {})
            {
                const effect = {
                    name: "Poisonous Mutations",
                    description: "Poison aura",
                    img: "poison.webp",
                    transfer,
                    disabled,
                    updates: [],
                    async update(data)
                    {
                        this.updates.push(data)
                        Object.assign(this, data)
                    }
                }

                return {
                    effect,
                    effects: {
                        contents: [effect]
                    }
                }
            }

            function createActor({ effects = [], items = [], exhaustion = 0 } = {})
            {
                return {
                    effects,
                    items,
                    system: { attributes: { exhaustion } },
                    updates: [],
                    getFlag: async (_scope, key) =>
                        key === "stage" ? 4 : null,
                    async update(data)
                    {
                        this.updates.push(data)
                    }
                }
            }

            function createActiveEffectRepository({ createdEffects = [], hasByName = () => false } = {})
            {
                return {
                    findAllByName: () => [],
                    removeByIds: async () => null,
                    getIdsByName: () => [],
                    hasByName,
                    create: async payload =>
                    {
                        createdEffects.push(payload)
                        return payload
                    }
                }
            }

            function createItemRepository({ poisonousMutationsItem = null, efficientKiller = false, embedded = {}, added = [], deleted = [] } = {})
            {
                return {
                    findEmbeddedByUuidFlag: (_actor, uuid) =>
                    {
                        if (uuid === POISONOUS_MUTATIONS_UUID) return poisonousMutationsItem
                        if (uuid === EFFICIENT_KILLER_UUID) return efficientKiller ? { id: "ek" } : null
                        return embedded[uuid] ?? null
                    },
                    addItemFromUuid: async ({ uuid }) =>
                    {
                        added.push(uuid)
                        return {
                            name: "Eldritch Limbs",
                            system: { activities: [] },
                            update: async () => null
                        }
                    },
                    deleteEmbedded: async (_actor, ids) =>
                    {
                        deleted.push(...ids)
                    }
                }
            }

            function createHandlers({ activeEffectRepository, itemRepository, getDialogFactory })
            {
                return createAberrantHorrorMacroHandlers({
                    activeEffectRepository,
                    itemRepository,
                    getDialogFactory,
                    tracker: createTracker(),
                    logger: console
                })
            }

            it("creates Poisonous Mutations when no actor effect is present", async function ()
            {
                const createdEffects = []
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository({ createdEffects }),
                    itemRepository: createItemRepository({ poisonousMutationsItem: createPoisonousMutationsItem() })
                })

                await handlers.chitinousShell({
                    actor: createActor(),
                    trigger: "on"
                })

                expect(createdEffects.length).to.equal(1)
                expect(createdEffects[0].name).to.equal("Poisonous Mutations")
            })

            it("does not create a duplicate Poisonous Mutations effect when one is already present", async function ()
            {
                const createdEffects = []
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository({
                        createdEffects,
                        hasByName: (_actor, name) => name === "Poisonous Mutations"
                    }),
                    itemRepository: createItemRepository({ poisonousMutationsItem: createPoisonousMutationsItem() })
                })

                await handlers.chitinousShell({
                    actor: createActor(),
                    trigger: "on"
                })

                expect(createdEffects.length).to.equal(0)
            })

            it("enables the transferred Poisonous Mutations aura when a mutation is manifested", async function ()
            {
                const createdEffects = []
                const poisonousMutationsItem = createPoisonousMutationsItem({ transfer: true, disabled: true })
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository({ createdEffects }),
                    itemRepository: createItemRepository({ poisonousMutationsItem })
                })

                await handlers.chitinousShell({
                    actor: createActor(),
                    trigger: "on"
                })

                expect(createdEffects.length).to.equal(0)
                expect(poisonousMutationsItem.effect.disabled).to.equal(false)
            })

            it("disables the Poisonous Mutations aura when the last mutation ends", async function ()
            {
                const poisonousMutationsItem = createPoisonousMutationsItem({ transfer: true, disabled: false })
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository(),
                    itemRepository: createItemRepository({ poisonousMutationsItem })
                })

                await handlers.slimyForm({
                    actor: createActor(),
                    trigger: "off",
                    effect: { _id: "slimy" }
                })

                expect(poisonousMutationsItem.effect.disabled).to.equal(true)
            })

            it("keeps the Poisonous Mutations aura when another mutation is still active", async function ()
            {
                const poisonousMutationsItem = createPoisonousMutationsItem({ transfer: true, disabled: false })
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository(),
                    itemRepository: createItemRepository({ poisonousMutationsItem })
                })

                await handlers.slimyForm({
                    actor: createActor({ effects: [{ id: "shell", name: "Chitinous Shell" }] }),
                    trigger: "off",
                    effect: { _id: "slimy" }
                })

                expect(poisonousMutationsItem.effect.disabled).to.equal(false)
                expect(poisonousMutationsItem.effect.updates.length).to.equal(0)
            })

            it("removes the Eldritch Limbs weapon when the mutation ends", async function ()
            {
                const deleted = []
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository(),
                    itemRepository: createItemRepository({
                        embedded: { [NORMAL_LIMBS_UUID]: { id: "limbs" } },
                        deleted
                    })
                })

                await handlers.eldritchLimbs({
                    actor: createActor(),
                    trigger: "off",
                    effect: { _id: "limbs-effect" }
                })

                expect(deleted).to.deep.equal(["limbs"])
            })

            it("keeps the Eldritch Limbs weapon when the mutation was manifested again", async function ()
            {
                const deleted = []
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository(),
                    itemRepository: createItemRepository({
                        embedded: { [NORMAL_LIMBS_UUID]: { id: "limbs" } },
                        deleted
                    })
                })

                await handlers.eldritchLimbs({
                    actor: createActor({ effects: [{ id: "new-limbs-effect", name: "Eldritch Limbs" }] }),
                    trigger: "off",
                    effect: { _id: "old-limbs-effect" }
                })

                expect(deleted.length).to.equal(0)
            })

            it("grants the melee limb next to the hurled barb for Efficient Killer (Piercing)", async function ()
            {
                const added = []
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository(),
                    itemRepository: createItemRepository({ efficientKiller: true, added }),
                    getDialogFactory: () => ({
                        openTransformationGeneralChoiceDialog: async () => "piercing"
                    })
                })

                await handlers.eldritchLimbs({
                    actor: createActor(),
                    trigger: "on"
                })

                expect(added).to.include(PIERCING_LIMBS_UUID)
                expect(added).to.include(NORMAL_LIMBS_UUID)
            })

            it("removes the Chitinous Shell AC bonus while heavy armor is worn", async function ()
            {
                const shell = {
                    id: "shell",
                    name: "Chitinous Shell",
                    changes: [
                        { key: "system.attributes.ac.bonus", mode: 2, value: "2" },
                        { key: "system.attributes.movement.walk", mode: 2, value: "-10" }
                    ],
                    async update(data)
                    {
                        Object.assign(this, data)
                    }
                }
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository(),
                    itemRepository: createItemRepository()
                })

                await handlers.chitinousShell({
                    actor: createActor({
                        effects: [shell],
                        items: [{ type: "equipment", system: { equipped: true, type: { value: "heavy" } } }]
                    }),
                    trigger: "on"
                })

                expect(shell.changes.map(c => c.key)).to.deep.equal(["system.attributes.movement.walk"])
            })

            it("keeps the Chitinous Shell AC bonus in medium armor", async function ()
            {
                const shell = {
                    id: "shell",
                    name: "Chitinous Shell",
                    changes: [{ key: "system.attributes.ac.bonus", mode: 2, value: "2" }],
                    async update(data)
                    {
                        Object.assign(this, data)
                    }
                }
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository(),
                    itemRepository: createItemRepository()
                })

                await handlers.chitinousShell({
                    actor: createActor({
                        effects: [shell],
                        items: [{ type: "equipment", system: { equipped: true, type: { value: "medium" } } }]
                    }),
                    trigger: "on"
                })

                expect(shell.changes.length).to.equal(1)
            })

            it("takes back Unstable Form exhaustion on a long rest", async function ()
            {
                const marker = {
                    id: "marker",
                    name: "Aberrant Exhaustion",
                    flags: { transformations: { exhaustionAdded: 2 } },
                    async update()
                    {
                        this.flags.transformations.exhaustionAdded = 0
                    }
                }
                const actor = createActor({ effects: [marker], exhaustion: 3 })
                const handlers = createHandlers({
                    activeEffectRepository: createActiveEffectRepository(),
                    itemRepository: createItemRepository()
                })

                await handlers.removeAberrantMutationEffects({
                    actor,
                    trigger: "longRest"
                })

                expect(actor.updates).to.deep.equal([{ "system.attributes.exhaustion": 1 }])
                expect(marker.flags.transformations.exhaustionAdded).to.equal(0)
            })
        })
    }
)
