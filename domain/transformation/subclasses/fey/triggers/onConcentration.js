export const onConcentration = {
    name: "concentration",

    actionGroups: [
        {
            name: "reset-weakend-constitution-save",
            when: {
                stage: {min: 3}
            },
            actions: [
                {
                    type: "SAVE",
                    when: {
                        effects: {name: "Hiding Hideous Appearance"}
                    },
                    data: {
                        ability: "con",
                        dc: "@transformationSaveDC",
                        key: "hideous-appearance-con-save",
                        title: "Hideous Appearance",
                        flavor: {
                            itemUuid: "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav",
                            subtitle: "Transformation Feature",
                            body: "When you become bloodied you need to roll a constitution saving throw. If you fail this save, your Horrific Appearance is revealed."
                        }
                    }
                },
                {
                    type: "EFFECT",
                    when: {
                        saveFailed: "hideous-appearance-con-save"
                    },
                    data: {
                        mode: "remove",
                        name: "Hiding Hideous Appearance"
                    }
                }
            ]
        }
    ]
}
