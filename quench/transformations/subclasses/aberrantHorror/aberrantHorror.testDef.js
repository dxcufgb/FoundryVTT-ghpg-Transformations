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
            name: "Long rest triggers mutation roll and applies effect stage 1",

            setup: async ({ actor }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
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
                    game.messages.some(m =>
                        m.flags?.core?.RollTable !== undefined
                    )
                )
            },

            finalAssertions: async ({ actor, expect, waiters }) =>
            {
                const rollMessages = game.messages.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )

                expect(rollMessages.length).to.equal(1)

                const message = rollMessages[0]

                expect(message.flavor).to.contain("Unstable Form Stage 1")

                const contentHtml = new DOMParser()
                    .parseFromString(message.content, "text/html")

                const element = contentHtml.querySelector(".name")
                const resultName = element?.textContent?.trim()

                const mutationEffects = () =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    )

                if (resultName === "No Effect") {

                    // Give the system one tick to finish
                    await waiters.waitForDomainStability?.()

                    expect(mutationEffects().length).to.equal(0)

                } else {

                    await waiters.waitForCondition(() =>
                        mutationEffects().length === 1
                    )

                    expect(mutationEffects().length).to.equal(1)
                }
            }
        },

        {
            name: "Long rest triggers mutation roll and applies effect stage 2",

            setup: async ({ actor }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
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
                    game.messages.some(m =>
                        m.flags?.core?.RollTable !== undefined
                    )
                )
            },

            finalAssertions: async ({ actor, expect, waiters }) =>
            {
                const rollMessages = game.messages.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )

                expect(rollMessages.length).to.equal(1)

                const message = rollMessages[0]

                expect(message.flavor).to.contain("Unstable Form Stage 2")

                const contentHtml = new DOMParser()
                    .parseFromString(message.content, "text/html")

                const element = contentHtml.querySelector(".name")
                const resultName = element?.textContent?.trim()

                const mutationEffects = () =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    )

                if (resultName === "No Effect") {

                    // Give the system one tick to finish
                    await waiters.waitForDomainStability?.()

                    expect(mutationEffects().length).to.equal(0)

                } else {

                    await waiters.waitForCondition(() =>
                        mutationEffects().length === 1
                    )

                    expect(mutationEffects().length).to.equal(1)
                }
            }
        },

        {
            name: "Long rest triggers mutation roll and applies effect stage 3",

            setup: async ({ actor }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
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
                    game.messages.some(m =>
                        m.flags?.core?.RollTable !== undefined
                    )
                )
            },

            finalAssertions: async ({ actor, expect, waiters }) =>
            {
                const rollMessages = game.messages.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )

                expect(rollMessages.length).to.equal(1)

                const message = rollMessages[0]

                expect(message.flavor).to.contain("Unstable Form Stage 3")

                const contentHtml = new DOMParser()
                    .parseFromString(message.content, "text/html")

                const element = contentHtml.querySelector(".name")
                const resultName = element?.textContent?.trim()

                const mutationEffects = () =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    )

                if (resultName === "No Effect") {

                    // Give the system one tick to finish
                    await waiters.waitForDomainStability?.()

                    expect(mutationEffects().length).to.equal(0)

                } else {

                    await waiters.waitForCondition(() =>
                        mutationEffects().length === 1
                    )

                    expect(mutationEffects().length).to.equal(1)
                }
            }
        },

        {
            name: "Long rest triggers mutation roll and applies effect stage 4",

            setup: async ({ actor }) =>
            {
                await ChatMessage.deleteDocuments(
                    game.messages.contents.map(m => m.id)
                )
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
                    game.messages.some(m =>
                        m.flags?.core?.RollTable !== undefined
                    )
                )
            },

            finalAssertions: async ({ actor, expect, waiters }) =>
            {
                const rollMessages = game.messages.filter(m =>
                    m.flags?.core?.RollTable !== undefined
                )

                expect(rollMessages.length).to.equal(1)

                const message = rollMessages[0]

                expect(message.flavor).to.contain("Unstable Form Stage 4")

                const contentHtml = new DOMParser()
                    .parseFromString(message.content, "text/html")

                const element = contentHtml.querySelector(".name")
                const resultName = element?.textContent?.trim()

                const mutationEffects = () =>
                    actor.effects.filter(e =>
                        e.origin?.includes("Unstable Form")
                    )

                if (resultName === "No Effect") {

                    // Give the system one tick to finish
                    await waiters.waitForDomainStability?.()

                    expect(mutationEffects().length).to.equal(0)

                } else {

                    await waiters.waitForCondition(() =>
                        mutationEffects().length === 1
                    )

                    expect(mutationEffects().length).to.equal(1)
                }
            }
        }

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
            uuid: "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",

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
            uuid: "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",

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
            uuid: "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",

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
            name: "Aberrant Mutation: Slimy Form grants acid, fire and cold resistance",
            uuid: "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",

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
            uuid: "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",

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
            uuid: "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",

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
        }

    ]
}