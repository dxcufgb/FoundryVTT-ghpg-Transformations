// test/definitions/aberrantHorror.testdef.js

export const AberrantHorrorTestDef = {
    id: "aberrant-horror",
    scenarios: [
        {
            name: "Basic test stage 1",
            steps: [
                { stage: 1 },
            ],
            finalAssertions: async ({ actor, expect }) =>
            {
                const expectedItemUuids = [
                    "Compendium.transformations.gh-transformations.Item.fqCu1G3ZS91WHTw9",
                    "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                    "Compendium.transformations.gh-transformations.Item.bsBdRmfRxCxzJokT"
                ]
                const actorSourceIds = actor.items.map(i =>
                    i.flags.transformations.sourceUuid
                )
                for (const uuid of expectedItemUuids) {
                    expect(
                        actorSourceIds.includes(uuid),
                        `Expected UUID ${uuid} was not found on actor`
                    ).to.equal(true)
                }
                expect(actor.system.type.subtype).to.be.equal("Aberration")
            }
        }
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
