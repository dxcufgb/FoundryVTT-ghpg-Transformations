// test/definitions/aberrantHorror.testdef.js

export const AberrantHorrorTestDef = {
    id: "aberrant-horror",
    scenarios: [
        {
            name: "stage 1",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT"
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
                helpers.expectRaceItemSubTypeOnActor(runtime, "Aberration", actor, expect)
            }
        },
        {
            name: "stage 2 with Efficient Killer",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 2 with Writhing Tendrils",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E"
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 3 with Terrifying Visage due to no options",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat"
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 3 with Constricting Tendrils",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5"
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 3 with Terrifying Visage as an option",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz",
                    "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
                    "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat"
                ]
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },
        {
            name: "stage 4 Entropic Abomation with no actor spell slots",
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
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
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
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
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.dPug75X8a0sc0dLz",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
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
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
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
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    choose: "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    choose: "Compendium.transformations.gh-transformations.Item.Q0c1NafrnW9C7tDz",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                }
            ],

            finalAssertions: async ({ runtime, actor, expect, helpers }) =>
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
                helpers.expectItemsOnActor(expectedItemUuids, actor, expect)
            }
        },

        {
            name: "Long rest triggers mutation roll and applies Aberrant Slow Speech, stage 1",

            setup: async ({ runtime }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                globalThis.___TransformationTestEnvironment___.rollTableResult = 60
            },

            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(
                            runtime,
                            actor,
                            waiters.waitForCondition,
                            1
                        )
                    }
                },
                {
                    trigger: "longRest"
                }
            ],

            finalAwait: async ({ actor, waiters }) =>
            {
                await waiters.waitForCondition(() =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    ).length > 0
                )
            },

            finalAssertions: async ({ actor, expect }) =>
            {
                // 1️⃣ Chat message
                const rollMessages = game.messages.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )

                expect(rollMessages.length).to.equal(1)

                const message = rollMessages[0]
                expect(message.flavor)
                    .to.contain("Unstable Form Stage 1")

                // 2️⃣ Effect applied
                const mutationEffects = actor.effects.filter(e =>
                    e.origin?.includes("Unstable Form")
                )

                expect(mutationEffects.length).to.equal(1)

                expect(mutationEffects[0].name)
                    .to.equal("Aberrant Slow Speech")
            }
        },

        {
            name: "Long rest triggers mutation roll and applies Aberrant Slow Speech, stage 2",

            setup: async ({ actor }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                globalThis.___TransformationTestEnvironment___.rollTableResult = 70
            },

            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }

                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    trigger: "longRest",
                }
            ],

            finalAwait: async ({ runtime, actor, waiters }) => 
            {
                await waiters.waitForCondition(() =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    ).length > 0
                )
            },

            finalAssertions: async ({ actor, expect }) =>
            {
                // 1️⃣ Chat message
                const rollMessages = game.messages.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )

                expect(rollMessages.length).to.equal(1)

                const message = rollMessages[0]
                expect(message.flavor)
                    .to.contain("Unstable Form Stage 2")

                // 2️⃣ Effect applied
                const mutationEffects = actor.effects.filter(e =>
                    e.origin?.includes("Unstable Form")
                )

                expect(mutationEffects.length).to.equal(1)

                expect(mutationEffects[0].name)
                    .to.equal("Aberrant Slow Speech")
            }
        },

        {
            name: "Long rest triggers mutation roll and applies Aberrant Slow Speech, stage 3",

            setup: async ({ actor }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                globalThis.___TransformationTestEnvironment___.rollTableResult = 80
            },

            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    trigger: "longRest",
                }
            ],

            finalAwait: async ({ runtime, actor, waiters }) => 
            {
                await waiters.waitForCondition(() =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    ).length > 0
                )
            },

            finalAssertions: async ({ actor, expect }) =>
            {
                // 1️⃣ Chat message
                const rollMessages = game.messages.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )

                expect(rollMessages.length).to.equal(1)

                const message = rollMessages[0]
                expect(message.flavor)
                    .to.contain("Unstable Form Stage 3")

                // 2️⃣ Effect applied
                const mutationEffects = actor.effects.filter(e =>
                    e.origin?.includes("Unstable Form")
                )

                expect(mutationEffects.length).to.equal(1)

                expect(mutationEffects[0].name)
                    .to.equal("Aberrant Slow Speech")
            }
        },

        {
            name: "Long rest triggers mutation roll and applies Aberrant Slow Speech, stage 4",

            setup: async ({ actor }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
                globalThis.___TransformationTestEnvironment___.rollTableResult = 90
            },

            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 1)
                    }
                },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 2)
                    }

                },
                {
                    stage: 3,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 3)
                    }
                },
                {
                    stage: 4,
                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForStageFinished(runtime, actor, waiters.waitForCondition, 4)
                    }
                },
                {
                    trigger: "longRest",

                    await: async ({ runtime, actor, waiters }) =>
                    {
                        await waiters.waitForDomainStability({
                            actor,
                            asyncTrackers: runtime.dependencies.utils.asyncTrackers
                        })
                    }
                }
            ],

            finalAwait: async ({ runtime, actor, waiters }) => 
            {
                await waiters.waitForCondition(() =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    ).length > 0
                )
            },

            finalAssertions: async ({ actor, expect }) =>
            {
                // 1️⃣ Chat message
                const rollMessages = game.messages.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )

                expect(rollMessages.length).to.equal(1)

                const message = rollMessages[0]
                expect(message.flavor)
                    .to.contain("Unstable Form Stage 4")

                // 2️⃣ Effect applied
                const mutationEffects = actor.effects.filter(e =>
                    e.origin?.includes("Unstable Form")
                )

                expect(mutationEffects.length).to.equal(1)

                expect(mutationEffects[0].name)
                    .to.equal("Aberrant Slow Speech")
            }
        }

    ],

    itemBehaviorTests: [
        {
            name: "Aberrant Form grants temp HP when bloodied",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
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
                waiters,
                actor
            }) =>
            {
                await waiters.waitForCondition(() =>
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

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
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

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                expect(actor.system.attributes.hp.temp)
                    .to.be.equal(0)
            }
        },

        {
            name: "Aberrant Mutation: Chitinous Shell applies AC +2 and -10 movement",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Chitinous Shell",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {

                const ac = actor.system.attributes.ac.value
                const walk = actor.system.attributes.movement.walk

                const activityEffects = actor.effects.filter(e =>
                    e.name == "Chitinous Shell"
                )

                expect(activityEffects.length).to.equal(1)

                expect(ac).to.be.equal(12) // adjust if base known
                expect(walk).to.be.equal(20)
            }
        },

        {
            name: "Aberrant Mutation: Eldritch Limbs grants weapon",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Eldritch Limbs",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                const activityEffects = actor.effects.filter(e =>
                    e.name == "Eldritch Limbs"
                )

                expect(activityEffects.length).to.equal(1)

                const weapon = actor.items.find(i =>
                    i.name === "Eldritch Limbs"
                )

                expect(weapon).to.exist
                expect(weapon.type).to.equal("weapon")
            }
        },

        {
            name: "Aberrant Mutation: Eldritch Limbs weapon attacks",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Eldritch Limbs",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                const weapon = actor.items.find(i =>
                    i.name === "Eldritch Limbs"
                )

                expect(weapon).to.exist

                const activity = weapon.system.activities.contents[0]
                expect(activity).to.exist

                const attackAbilities = activity.availableAbilities
                expect(attackAbilities.size).to.be.equal(2)
                expect(attackAbilities).to.include.members([
                    "str",
                    "dex"
                ])

                const damageParts = activity.damage.parts[0]
                expect(damageParts).to.exist

                const damageTypes = damageParts.types
                expect(damageTypes.size).to.be.equal(3)
                expect(damageTypes).to.include.members([
                    "bludgeoning",
                    "piercing",
                    "slashing"
                ])

                expect(damageParts.number).to.be.equal(1)
                expect(damageParts.denomination).to.be.equal(8)
            }
        },

        {
            name: "Aberrant Mutation: Slimy Form grants acid, fire and cold resistance",

            requiredPath: [
                { stage: 1 }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Slimy Form",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                const activityEffects = actor.effects.filter(e =>
                    e.name == "Slimy Form"
                )

                expect(activityEffects.length).to.equal(1)

                const resistances = actor.system.traits.dr.value

                expect(resistances).to.include.members([
                    "acid",
                    "fire",
                    "cold"
                ])
            }
        },

        {
            name: "Switching activities replaces previous effect",

            requiredPath: [
                { stage: 1 }
            ],

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Chitinous Shell",
                        macroTrigger: "on"
                    })
                },

                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Slimy Form",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                const activityEffects = actor.effects.filter(e =>
                    e.name == "Slimy Form"
                )

                expect(activityEffects.length).to.equal(1)

                // AC bonus should be gone
                const ac = actor.system.attributes.ac.value

                expect(ac).to.not.be.greaterThan(12) // adjust if base known

                // Resistances should now exist
                const resistances = actor.system.traits.dr.value

                expect(resistances).to.include.members([
                    "acid",
                    "fire",
                    "cold"
                ])
            }
        },

        {
            name: "Switching activities replaces previous effect",

            requiredPath: [
                { stage: 1 }
            ],

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Chitinous Shell",
                        macroTrigger: "on"
                    })
                },

                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Slimy Form",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                const activityEffects = actor.effects.filter(e =>
                    e.name == "Slimy Form"
                )

                expect(activityEffects.length).to.equal(1)

                // AC bonus should be gone
                const ac = actor.system.attributes.ac.value

                expect(ac).to.not.be.greaterThan(12) // adjust if base known

                // Resistances should now exist
                const resistances = actor.system.traits.dr.value

                expect(resistances).to.include.members([
                    "acid",
                    "fire",
                    "cold"
                ])
            }
        },

        {
            name: "Efficient killer grants updated Eldritch Limbs",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Aberrant Mutation",
                        effectName: "Eldritch Limbs",
                        macroTrigger: "on"
                    })
                }
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                const bludgeoning = actor.items.find(i =>
                    i.name === "Eldritch Limbs (Bludgeoning)"
                )

                const piercing = actor.items.find(i =>
                    i.name === "Eldritch Limbs (Piercing)"
                )

                const slashing = actor.items.find(i =>
                    i.name === "Eldritch Limbs (Slashing)"
                )

                expect(bludgeoning).to.exist
                expect(piercing).to.exist
                expect(slashing).to.exist
                const weapons = [
                    {
                        object: bludgeoning,
                        numberOfAttackAbilities: 2,
                        attackAbilities: [
                            "str",
                            "dex"
                        ],
                        numberOfDamageTypes: 1,
                        damageTypes: ["bludgeoning"],
                        damageDenomination: 8,
                        damageNumber: 2
                    },
                    {
                        object: piercing,
                        numberOfAttackAbilities: 2,
                        attackAbilities: [
                            "str",
                            "dex"
                        ],
                        numberOfDamageTypes: 1,
                        damageTypes: ["piercing"],
                        damageDenomination: 6,
                        damageNumber: 2
                    },
                    {
                        object: slashing,
                        numberOfAttackAbilities: 2,
                        attackAbilities: [
                            "str",
                            "dex"
                        ],
                        numberOfDamageTypes: 1,
                        damageTypes: ["slashing"],
                        damageDenomination: 8,
                        damageNumber: 2
                    },
                ]

                for (const weapon of weapons) {
                    const activity = weapon.object.system.activities.contents[0]
                    expect(activity).to.exist

                    const attackAbilities = activity.availableAbilities
                    expect(attackAbilities.size).to.be.equal(weapon.numberOfAttackAbilities)
                    expect(attackAbilities).to.include.members(weapon.attackAbilities)

                    const damageParts = activity.damage.parts[0]
                    expect(damageParts).to.exist

                    const damageTypes = damageParts.types
                    expect(damageTypes.size).to.be.equal(weapon.numberOfDamageTypes)
                    expect(damageTypes).to.include.members(weapon.damageTypes)

                    expect(damageParts.number).to.be.equal(weapon.damageNumber)
                    expect(damageParts.denomination).to.be.equal(weapon.damageDenomination)
                }
            }
        },

        {
            name: "Writhing Tendrils",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E"
                }
            ],

            setup: async ({ actor }) =>
            {
                await actor.update({
                    "system.attributes.movement.walk": 30
                })
            },

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                const prof = actor.system.attributes.prof
                const writhingTendrils = actor.items.find(i =>
                    i.name === "Writhing Tendrils"
                )
                expect(writhingTendrils).to.exist

                const activities = writhingTendrils.system.activities.contents
                expect(activities.length).to.be.equal(3)

                const aberrantPushback = activities.find(a => a.name == "Aberrant Pushback")
                expect(aberrantPushback).to.exist
                expect(aberrantPushback.activation.type).to.be.equal("reaction")
                expect(aberrantPushback.save.ability).to.include.members(["str"])
                expect(aberrantPushback.save.dc.value).to.be.equal(prof + 2 + 8)

                const aberrantDisengage = activities.find(a => a.name == "Aberrant Disengage")
                expect(aberrantDisengage).to.exist
                expect(aberrantDisengage.activation.type).to.be.equal("bonus")

                const aberrantAffliction = activities.find(a => a.name == "Aberrant Affliction")
                expect(aberrantAffliction).to.exist
                expect(aberrantAffliction.activation.type).to.be.equal("reaction")
                expect(aberrantAffliction.spell.uuid).to.be.equal("Compendium.transformations.gh-transformations.Item.5t4cjiimldjKmwlK")
            }
        },

        {
            name: "Hideous Appearance hide hideous form",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            steps: [

                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                const activeEffect = actor.effects.find(i => i.name == "Hiding Hideous Appearance")
                expect(activeEffect).to.exist
            }
        },

        {
            name: "Hideous Appearance saving throw success on bloodied",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "bloodied",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                expect(globalThis.___TransformationTestEnvironment___.saveRolled).to.be.equal(true)
                const hideousAppearanceEffect = actor.effects.find(e => e.name == "Hiding Hideous Appearance")
                expect(hideousAppearanceEffect).to.exist
            }
        },

        {
            name: "Hideous Appearance saving throw fail on bloodied",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "bloodied",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                expect(globalThis.___TransformationTestEnvironment___.saveRolled).to.be.equal(true)
                const hideousAppearanceEffect = actor.effects.find(e => e.name == "Hiding Hideous Appearance")
                expect(hideousAppearanceEffect).to.not.exist
            }
        },

        {
            name: "Hideous Appearance saving throw success on unconscious",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "unconscious",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                expect(globalThis.___TransformationTestEnvironment___.saveRolled).to.be.equal(true)
                const hideousAppearanceEffect = actor.effects.find(e => e.name == "Hiding Hideous Appearance")
                expect(hideousAppearanceEffect).to.exist
            }
        },

        {
            name: "Hideous Appearance saving throw fail on unconscious",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "unconscious",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                expect(globalThis.___TransformationTestEnvironment___.saveRolled).to.be.equal(true)
                const hideousAppearanceEffect = actor.effects.find(e => e.name == "Hiding Hideous Appearance")
                expect(hideousAppearanceEffect).to.not.exist
            }
        },

        {
            name: "Hideous Appearance saving throw success on beginConcentration",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 13
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "concentration",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                expect(globalThis.___TransformationTestEnvironment___.saveRolled).to.be.equal(true)
                const hideousAppearanceEffect = actor.effects.find(e => e.name == "Hiding Hideous Appearance")
                expect(hideousAppearanceEffect).to.exist
            }
        },

        {
            name: "Hideous Appearance saving throw fail on beginConcentration",

            requiredPath: [
                { stage: 1 },
                {
                    stage: 2,
                    choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
                }
            ],

            setup: async ({ actor }) =>
            {
                globalThis.___TransformationTestEnvironment___.saveResult = 12
                globalThis.___TransformationTestEnvironment___.saveRolled = false
            },

            steps: [
                async ({ actor, helpers }) =>
                {
                    await helpers.applyItemActivityEffect({
                        actor,
                        itemName: "Hideous Appearance",
                        effectName: "Hiding Hideous Appearance",
                        macroTrigger: "on"
                    })
                },
            ],

            trigger: "concentration",

            await: async ({ runtime, waiters, actor }) =>
            {
                await waiters.waitForDomainStability({
                    actor,
                    asyncTrackers: runtime.dependencies.utils.asyncTrackers
                })
            },

            assertions: async ({ actor, expect }) =>
            {
                expect(globalThis.___TransformationTestEnvironment___.saveRolled).to.be.equal(true)
                const hideousAppearanceEffect = actor.effects.find(e => e.name == "Hiding Hideous Appearance")
                expect(hideousAppearanceEffect).to.not.exist
            }
        },
    ]
}