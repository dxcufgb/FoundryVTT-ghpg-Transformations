// test/definitions/aberrantHorror.testdef.js

import { expectItemsOnActor, expectRaceItemSubTypeOnActor } from "../../../helpers/actors.js"

export const AberrantHorrorTestDef = {
    id: "aberrant-horror",
    scenarios: [
        {
            name: "Basic test stage 1",
            // setup: async ({ actor }) =>
            // {

            // },
            steps: [
                {
                    stage: 1,
                    await: async ({ runtime, actor, waitForCondition }) =>
                    {
                        await stageAwait(runtime, actor, waitForCondition, 1)
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
        // {
        //     name: "Basic test stage 2 with efficient killer",
        //     // setup: async ({ actor }) =>
        //     // {

        //     // },
        //     steps: [
        //         {
        //             stage: 1,
        //             await: stageAwait(1)
        //         },
        //         {
        //             stage: 2,
        //             choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq",
        //             await: stageAwait(2)

        //         }
        //     ],

        //     finalAssertions: async ({ runtime, actor, expect }) =>
        //     {
        //         const expectedItemUuids = [
        //             "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
        //             "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
        //             "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT",
        //             "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
        //             "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
        //         ]
        //         expectItemsOnActor(expectedItemUuids, actor)
        //     }
        // }
        // ,
        // {
        //     name: "Basic test 1-4",
        //     steps: [
        //         { stage: 1 },
        //         {
        //             stage: 2,
        //             choose: 'Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E'
        //         },
        //         {
        //             stage: 3,
        //             choose: 'Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5'
        //         },
        //         {
        //             stage: 4,
        //             choose: 'Compendium.transformations.gh-transformations.Item.Q0c1NafrnW9C7tDz'
        //         }
        //     ],
        //     finalAssertions: async ({ actor }) =>
        //     {
        //         const expectedItemUuids = [
        //             "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
        //             "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
        //             "Compendium.transformations.gh-transformations.Item.bZIioCqc5wwEUdKG",
        //             "Compendium.transformations.gh-transformations.Item.xmCGLWU5p3RjVmRV",
        //             'Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E',
        //             'Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5',
        //             'Compendium.transformations.gh-transformations.Item.Q0c1NafrnW9C7tDz'
        //         ]
        //         const actorSourceIds = actor.items.map(i =>
        //             i.flags.transformations.sourceUuid
        //         )
        //         expect(expectedItemUuids.every(uuid =>
        //             actorSourceIds.includes(uuid)
        //         )).to.equal(true)
        //     }
        // }
        // ,

        // {
        //     name: "Prerequisite path through stage 3",
        //     steps: [
        //         { stage: 1 },
        //         {
        //             stage: 2,
        //             choose: "Compendium.transformations.gh-transformations.Item.dQECAYtnFKFfmX3E"
        //         },
        //         {
        //             stage: 3,
        //             expectDialog: true,
        //             choose: "Compendium.transformations.gh-transformations.Item.QO6SsGjul4dZUxd5"
        //         }
        //     ],
        //     finalAssertions: async ({ actor }) =>
        //     {
        //         expect(actor.items.some(i =>
        //             i.flags?.core?.sourceId ===
        //             "Compendium.transformations.gh-transformations.Item.jEd1HSOhm7sJcNXz"
        //         )).to.equal(true)
        //     }
        // },

        // {
        //     name: "Non-prerequisite path auto-resolves stage 3",
        //     steps: [
        //         { stage: 1 },
        //         {
        //             stage: 2,
        //             choose: "Compendium.transformations.gh-transformations.Item.kYvA2no3p5xCHUrq"
        //         },
        //         {
        //             stage: 3,
        //             expectDialog: false
        //         }
        //     ],
        //     finalAssertions: async ({ actor }) =>
        //     {
        //         const stage3Choice = actor.getFlag(
        //             "transformations",
        //             "stageChoices"
        //         )?.[AberrantHorrorDefinition.id]?.[3]

        //         expect(stage3Choice).to.equal(
        //             "Compendium.transformations.gh-transformations.Item.aJasAyo9CCBdyuat"
        //         )
        //     }
        // }
    ],

    // itemBehaviorTests: {
    // "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu": {
    //     test: async ({ actor }) =>
    //     {
    //         // simulate being bloodied
    //         await actor.update({
    //             "system.attributes.hp.value": Math.floor(actor.system.attributes.hp.max / 2)
    //         })

    //         // simulate damage application hook or rest
    //         Hooks.call("updateActor", actor)

    //         // verify tempHP gained
    //         expect(actor.system.attributes.hp.temp).to.be.greaterThan(0)
    //     }
    // }
    // }
}

async function stageAwait(runtime, actor, waitForCondition, stage)
{
    await runtime.dependencies.utils.asyncTrackers.whenIdle()
    if (stage == 1) {
        await waitForCondition(() =>
        {
            const raceItem = runtime.infrastructure.itemRepository.findEmbeddedByType(actor, "race")
            return Boolean(raceItem?.system?.type?.subtype)
        })
    } else {

    }
}