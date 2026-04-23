const SERAPH_STAGE_FOUR_ITEM_UUID =
          "Compendium.transformations.gh-transformations.Item.nbEepKdcM50RJvbI"

const SERAPH_STAGE_FOUR_EFFECT_UUID =
          "Compendium.transformations.gh-transformations.Item.nbEepKdcM50RJvbI.ActiveEffect.jtTKgErRNcmd9Ewh"

export const onSavingThrow = {
    name: "savingThrow",

    actionGroups: [
        {
            name: "apply seraph stage 4 effect on natural 1 saving throw",
            when: {
                stage: [4],
                items: {
                    has: [SERAPH_STAGE_FOUR_ITEM_UUID]
                },
                custom: {
                    saves: {
                        current: {
                            naturalRoll: 1
                        }
                    }
                }
            },
            actions: [
                {
                    type: "EFFECT",
                    data: {
                        mode: "instantiate",
                        uuid: SERAPH_STAGE_FOUR_EFFECT_UUID
                    }
                }
            ]
        }
    ]
}
