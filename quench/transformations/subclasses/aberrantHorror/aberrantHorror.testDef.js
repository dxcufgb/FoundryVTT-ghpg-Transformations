// test/definitions/aberrantHorror.testdef.js

import { expectItemsOnActor, expectRaceItemSubTypeOnActor } from "../../../helpers/actors.js"
import { waitForStageFinished } from "../../../helpers/awaitStage.js"

export const AberrantHorrorTestDef = {
    id: "aberrant-horror",
    scenarios: [
        {
            name: "stage 1",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT"
                ]
                expectItemsOnActor(expectedItemUuids, actor, expect)
                expectRaceItemSubTypeOnActor(runtime, "Aberration", actor, expect)
            }
        },
        {
            name: "stage 2 with Efficient Killer",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 2)
                    }

                }
            ],

            finalAssertions: async ({ runtime, actor, expect }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                ]
                expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 2 with Writhing Tendrils",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 2)
                    }

                }
            ],

            finalAssertions: async ({ runtime, actor, expect }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E"
                ]
                expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 3 with Terrifying Visage due to no options",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat"
                ]
                expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 3 with Constricting Tendrils",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5"
                ]
                expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 3 with Terrifying Visage as an option",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat"
                ]
                expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 4 Entropic Abomation with no actor spell slots",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bZIioCqc5wwEUdKG",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                ]
                expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 4 Entropic Abomation with actor spell slots",
            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.spells.spell1.override": 1,
                    "system.spells.spell1.value": 1
                })
            },
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bZIioCqc5wwEUdKG",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz"
                ]
                expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 4 Poisonouse Mutations with actor spell slots",
            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.spells.spell1.override": 1,
                    "system.spells.spell1.value": 1
                })
            },
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.Q0c1NafrnW9C7tDz",
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await waitForStageFinished(runtime, actor, waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bZIioCqc5wwEUdKG",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    "Compendium.transformations.gh-transformations.Item.Q0c1NafrnW9C7tDz"
                ]
                expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },

    ],

    itemBehaviorTests: [
        {
            name: "Aberrant Form grants temp HP when bloodied",
            uuid: "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {

            },

            steps: [
                async ({ actor }) =>
                {
                    await actor.update({
                        "system.attributes.hp.value":
                            Math.floor(actor.system.attributes.hp.max / 2)
                    })
                }
            ],

            await: async ({
                waiters: {
                    waitForCondition
                },
                actor }) =>
            {
                await waitForCondition(() =>
                    actor.system.attributes.hp.temp > 0
                )
            },

            assertions: async ({ actor, expect }) =>
            {
                const actorProf = actor.system.attributes.prof
                expect(actor.system.attributes.hp.temp)
                    .to.be.equal(1 + actorProf)
                const item = actor.items.find(i => i.flags.transformations?.sourceUuid == "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu")
                const usesLeft = item.system.uses.max - item.system.uses.spent
                expect(usesLeft).to.be.equal(0)
            }
        },
        {
            name: "Aberrant Form only grants temp HP once per rest",
            uuid: "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {

            },

            steps: [
                async ({ actor }) =>
                {
                    const item = actor.items.find(i => i.flags.transformations?.sourceUuid == "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu")
                    item.update({
                        "item.system.uses.spent": item.system.uses.max
                    })
                    await actor.update({
                        "system.attributes.hp.value":
                            Math.floor(actor.system.attributes.hp.max / 2)
                    })
                }
            ],

            await: async ({ runtime, waiters: { waitForDomainStability }, actor }) =>
            {
                await waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {

                expect(actor.system.attributes.hp.temp)
                    .to.be.equal(0)
            }
        }

    ]
}