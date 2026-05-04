import { createAberrantHorrorMacroHandlers } from "../../../../domain/transformation/subclasses/aberrantHorror/macros/handlers.js"

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

            function createPoisonousMutationsItem({ transfer = false } = {})
            {
                return {
                    effects: {
                        contents: [
                            {
                                name: "Poisonous Mutations",
                                description: "Poison aura",
                                img: "poison.webp",
                                transfer
                            }
                        ]
                    }
                }
            }

            function createActor()
            {
                return {
                    getFlag: async (_scope, key) =>
                        key === "stage" ? 4 : null
                }
            }

            it("creates Poisonous Mutations when no actor effect is present", async function ()
            {
                const createdEffects = []
                const actor = createActor()
                const activeEffectRepository = {
                    findAllByName: () => [],
                    removeByIds: async () => null,
                    hasByName: () => false,
                    create: async payload =>
                    {
                        createdEffects.push(payload)
                        return payload
                    }
                }
                const itemRepository = {
                    findEmbeddedByUuidFlag: (_actor, uuid) =>
                    {
                        if (uuid !== "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz") {
                            return null
                        }

                        return createPoisonousMutationsItem()
                    },
                    deleteEmbedded: async () => null
                }

                const handlers = createAberrantHorrorMacroHandlers({
                    activeEffectRepository,
                    itemRepository,
                    tracker: createTracker(),
                    logger: console
                })

                await handlers.chitinousShell({
                    actor,
                    trigger: "on"
                })

                expect(createdEffects.length).to.equal(1)
                expect(createdEffects[0].name).to.equal("Poisonous Mutations")
            })

            it("does not create a duplicate Poisonous Mutations effect when one is already present", async function ()
            {
                const createdEffects = []
                const actor = createActor()
                const activeEffectRepository = {
                    findAllByName: () => [],
                    removeByIds: async () => null,
                    hasByName: (_actor, name) => name === "Poisonous Mutations",
                    create: async payload =>
                    {
                        createdEffects.push(payload)
                        return payload
                    }
                }
                const itemRepository = {
                    findEmbeddedByUuidFlag: (_actor, uuid) =>
                    {
                        if (uuid !== "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz") {
                            return null
                        }

                        return createPoisonousMutationsItem()
                    },
                    deleteEmbedded: async () => null
                }

                const handlers = createAberrantHorrorMacroHandlers({
                    activeEffectRepository,
                    itemRepository,
                    tracker: createTracker(),
                    logger: console
                })

                await handlers.chitinousShell({
                    actor,
                    trigger: "on"
                })

                expect(createdEffects.length).to.equal(0)
            })

            it("does not create a manual Poisonous Mutations effect when the item effect transfers automatically", async function ()
            {
                const createdEffects = []
                const actor = createActor()
                const activeEffectRepository = {
                    findAllByName: () => [],
                    removeByIds: async () => null,
                    hasByName: () => false,
                    create: async payload =>
                    {
                        createdEffects.push(payload)
                        return payload
                    }
                }
                const itemRepository = {
                    findEmbeddedByUuidFlag: (_actor, uuid) =>
                    {
                        if (uuid !== "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz") {
                            return null
                        }

                        return createPoisonousMutationsItem({ transfer: true })
                    },
                    deleteEmbedded: async () => null
                }

                const handlers = createAberrantHorrorMacroHandlers({
                    activeEffectRepository,
                    itemRepository,
                    tracker: createTracker(),
                    logger: console
                })

                await handlers.chitinousShell({
                    actor,
                    trigger: "on"
                })

                expect(createdEffects.length).to.equal(0)
            })
        })
    }
)
