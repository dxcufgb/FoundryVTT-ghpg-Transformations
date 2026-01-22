export const onBloodied = {
    name: "bloodied",

    variables: [
        {
            name: "regainedHitPoints",
            type: "formula",
            value: "@prof + @transformation.stage"
        },
        // {
        //     name: "transformationSaveDC",
        //     type: "formula",
        //     value: ""
        // }
    ],

    actions: [
        {
            type: "item",
            when: {
                stage: { min: 1 },
                items: {
                    has: [
                        "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu"
                    ],
                    usesRemaining: { min: 1 }
                }
            },
            data: {
                uuid: "Compendium.transformations.gh-transformations.Item.EUL3OB8Il8nTydsu",
                mode: "consume",
                blocker: true,
                uses: 1
            }
        },

        {
            type: "hp",
            when: {
                stage: { min: 1 }
            },
            data: {
                mode: "temp",
                value: "@regainedHitPoints"
            }
        },

        {
            type: "chat",
            when: {
                stage: { min: 1 },
            },
            data: {
                message: "Aberrant Form activates and gives @regainedHitPoints temporary hit points!"
            }
        },

        {
            type: "save",
            when: {
                stage: { min: 2 },
                effects: { name: "Hiding Hideous Appearance" }
            },
            data: {
                ability: "con",
                dc: "@transformationSaveDC",
                key: "hideous-appearance-con-save",
            }
        },

        {
            type: "effect",
            when: {
                stage: { min: 2 },
                saveFailed: "hideous-appearance-con-save"
            },
            data: {
                mode: "remove",
                name: "Hiding Hideous Appearance"
            }
        },

        {
            type: "rollTable",
            when: {
                stage: { min: 4 },
            },
            once: {
                key: "bloodied-roll",
                reset: "longRest"
            },
            data: {
                uuid: "Compendium.transformations.tables.BloodiedMutation",
                mode: "downgradeOnly"
            }
        }
    ]
};