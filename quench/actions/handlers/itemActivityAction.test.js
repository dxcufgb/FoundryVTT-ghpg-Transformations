import { createItemActivityAction } from "../../../services/actions/handlers/itemActivity.js"
import { setupTest, tearDownEachTest } from "../../testLifecycle.js"

export function registerItemActivityActionTests({ describe, it, expect })
{
    describe("Item Activity Action Handler", function()
    {
        let actor
        let handler
        let fakeRepo
        let calls

        beforeEach(async function()
        {
            let fakeTracker
            ({ actor, fakeTracker } = await setupTest({
                currentTest: this.currentTest,
                createObjects: {
                    actor: { options: { race: "humanoid" } },
                    fakeTracker: {}
                }
            }))

            calls = []

            fakeRepo = {
                __itemsById: new Map(),
                __itemsByUuid: new Map(),

                findEmbeddedById(_actor, itemId)
                {
                    return this.__itemsById.get(itemId) ?? null
                },

                findEmbeddedByUuidFlag(_actor, itemUuid)
                {
                    return this.__itemsByUuid.get(itemUuid) ?? null
                }
            }

            handler = createItemActivityAction({
                itemRepository: fakeRepo,
                tracker: fakeTracker,
                logger: console
            })
        })

        afterEach(async function()
        {
            await tearDownEachTest()
        })

        it("uses an embedded item directly when no activity selector is provided", async function()
        {
            const item = {
                id: "item-1",
                uuid: "Actor.actor-1.Item.item-1",
                flags: {
                    transformations: {
                        sourceUuid: "Compendium.transformations.test.Item.item-1"
                    }
                },
                async use(config)
                {
                    calls.push({
                        fn: "item.use",
                        config
                    })
                }
            }

            fakeRepo.__itemsByUuid.set(
                "Compendium.transformations.test.Item.item-1",
                item
            )

            const result = await handler({
                actor,
                action: {
                    data: {
                        itemUuid: "Compendium.transformations.test.Item.item-1"
                    }
                }
            })

            expect(result).to.equal(true)
            expect(calls).to.have.length(1)
            expect(calls[0].fn).to.equal("item.use")
            expect(calls[0].config).to.equal(undefined)
        })

        it("uses a specific embedded activity resolved by compendium activity uuid", async function()
        {
            const activity = {
                id: "activity-1",
                _stats: {
                    compendiumSource:
                        "Compendium.transformations.test.Item.item-2.Activity.activity-1"
                },
                async use(config)
                {
                    calls.push({
                        fn: "activity.use",
                        config
                    })
                }
            }
            const item = {
                id: "item-2",
                uuid: "Actor.actor-1.Item.item-2",
                flags: {
                    transformations: {
                        sourceUuid: "Compendium.transformations.test.Item.item-2"
                    }
                },
                system: {
                    activities: [activity]
                }
            }

            fakeRepo.__itemsByUuid.set(
                "Compendium.transformations.test.Item.item-2",
                item
            )

            const result = await handler({
                actor,
                action: {
                    data: {
                        itemUuid: "Compendium.transformations.test.Item.item-2",
                        activityUuid:
                            "Compendium.transformations.test.Item.item-2.Activity.activity-1"
                    }
                }
            })

            expect(result).to.equal(true)
            expect(calls).to.have.length(1)
            expect(calls[0].fn).to.equal("activity.use")
            expect(calls[0].config).to.equal(undefined)
        })

        it("falls back to the only activity when the item has no direct use method", async function()
        {
            const activity = {
                id: "activity-only",
                async use(config)
                {
                    calls.push({
                        fn: "single-activity.use",
                        config
                    })
                }
            }
            const item = {
                id: "item-3",
                uuid: "Actor.actor-1.Item.item-3",
                flags: {
                    transformations: {
                        sourceUuid: "Compendium.transformations.test.Item.item-3"
                    }
                },
                system: {
                    activities: [activity]
                }
            }

            fakeRepo.__itemsByUuid.set(
                "Compendium.transformations.test.Item.item-3",
                item
            )

            const result = await handler({
                actor,
                action: {
                    data: {
                        itemUuid: "Compendium.transformations.test.Item.item-3"
                    }
                }
            })

            expect(result).to.equal(true)
            expect(calls).to.have.length(1)
            expect(calls[0].fn).to.equal("single-activity.use")
            expect(calls[0].config).to.equal(undefined)
        })

        it("returns false when an explicit activity selector does not resolve a callable activity", async function()
        {
            const item = {
                id: "item-4",
                uuid: "Actor.actor-1.Item.item-4",
                flags: {
                    transformations: {
                        sourceUuid: "Compendium.transformations.test.Item.item-4"
                    }
                },
                async use()
                {
                    calls.push({
                        fn: "item.use"
                    })
                },
                system: {
                    activities: []
                }
            }

            fakeRepo.__itemsByUuid.set(
                "Compendium.transformations.test.Item.item-4",
                item
            )

            const result = await handler({
                actor,
                action: {
                    data: {
                        itemUuid: "Compendium.transformations.test.Item.item-4",
                        activityId: "missing-activity"
                    }
                }
            })

            expect(result).to.equal(false)
            expect(calls).to.have.length(0)
        })

        it("uses an item resolved by embedded item id", async function()
        {
            const item = {
                id: "item-5",
                uuid: "Actor.actor-1.Item.item-5",
                async use(config)
                {
                    calls.push({
                        fn: "item.use",
                        config
                    })
                }
            }

            fakeRepo.__itemsById.set("item-5", item)

            const result = await handler({
                actor,
                action: {
                    data: {
                        itemId: "item-5"
                    }
                }
            })

            expect(result).to.equal(true)
            expect(calls).to.have.length(1)
            expect(calls[0].fn).to.equal("item.use")
            expect(calls[0].config).to.equal(undefined)
        })

        it("uses an activity resolved by activity id via the activities collection get method", async function()
        {
            const activity = {
                id: "activity-5",
                async use(config)
                {
                    calls.push({
                        fn: "activity.use",
                        config
                    })
                }
            }
            const item = {
                id: "item-6",
                uuid: "Actor.actor-1.Item.item-6",
                flags: {
                    transformations: {
                        sourceUuid: "Compendium.transformations.test.Item.item-6"
                    }
                },
                system: {
                    activities: {
                        contents: [activity],
                        get(activityId)
                        {
                            return activityId === "activity-5" ? activity : null
                        }
                    }
                }
            }

            fakeRepo.__itemsByUuid.set(
                "Compendium.transformations.test.Item.item-6",
                item
            )

            const result = await handler({
                actor,
                action: {
                    data: {
                        itemUuid: "Compendium.transformations.test.Item.item-6",
                        activityId: "activity-5"
                    }
                }
            })

            expect(result).to.equal(true)
            expect(calls).to.have.length(1)
            expect(calls[0].fn).to.equal("activity.use")
            expect(calls[0].config).to.equal(undefined)
        })

        it("returns false when there is no callable item use and no unambiguous fallback activity", async function()
        {
            const item = {
                id: "item-7",
                uuid: "Actor.actor-1.Item.item-7",
                flags: {
                    transformations: {
                        sourceUuid: "Compendium.transformations.test.Item.item-7"
                    }
                },
                system: {
                    activities: [
                        {
                            id: "activity-7a",
                            async use() {}
                        },
                        {
                            id: "activity-7b",
                            async use() {}
                        }
                    ]
                }
            }

            fakeRepo.__itemsByUuid.set(
                "Compendium.transformations.test.Item.item-7",
                item
            )

            const result = await handler({
                actor,
                action: {
                    data: {
                        itemUuid: "Compendium.transformations.test.Item.item-7"
                    }
                }
            })

            expect(result).to.equal(false)
            expect(calls).to.have.length(0)
        })
    })
}
