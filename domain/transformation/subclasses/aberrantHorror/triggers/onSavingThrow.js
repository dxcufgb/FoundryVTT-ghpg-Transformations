export const onSavingThrow = {
    name: "savingThrow",

    actionGroups: [
        {
            name: "apply lower aberrant effect stage 3",
            when: {
                stage: [3],
                custom: "isSpell && (naturalRoll === 1 || naturalRoll === 2)"
            },
            actions: [
                {
                    type: "APPLY_ROLLTABLE",
                    data: {
                        uuid: "Compendium.transformations.gh-roll-tables.RollTable.7M7eNAAjMGQhSiVY",
                        mode: "downgradeOnly"
                    }
                },
                {
                    type: "EFFECT",
                    data: {
                        mode: "remove",
                        name: "Hiding Hideous Appearance"
                    }
                }
            ]
        },
        {
            name: "apply lower aberrant effect stage 4",
            when: {
                stage: [4],
                custom: "isSpell && (naturalRoll === 1 || naturalRoll === 2)"
            },
            actions: [
                {
                    type: "APPLY_ROLLTABLE",
                    data: {
                        uuid: "Compendium.transformations.gh-roll-tables.RollTable.bBA81xCQndyJAIPi",
                        mode: "downgradeOnly"
                    }
                },
                {
                    type: "EFFECT",
                    data: {
                        mode: "remove",
                        name: "Hiding Hideous Appearance"
                    }
                }
            ]
        }
    ]
}