export const onSavingThrow = {
    name: "savingThrow",

    actionGroups: [
        {
            name: "planar binding disadvantage",
            once: {

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
    ]
}