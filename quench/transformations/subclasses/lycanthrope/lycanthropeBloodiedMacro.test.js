import {
    LYCANTHROPE_HYBRID_FORM_ITEM_UUIDS,
    LYCANTHROPE_TRANSFORM_ACTIVITY_NAME
} from "../../../../domain/transformation/subclasses/lycanthrope/constants.js"
import { createLycanthropeMacroHandlers } from "../../../../domain/transformation/subclasses/lycanthrope/macros/handlers.js"
import { lycanthropeMacros } from "../../../../domain/transformation/subclasses/lycanthrope/macros.js"

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

            it("uses the Transform activity from the first matching hybrid form item", async function()
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
        })
    }
)
