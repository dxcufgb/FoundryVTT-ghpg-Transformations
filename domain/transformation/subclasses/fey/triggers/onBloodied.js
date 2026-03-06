export const onBloodied = {
    name: "bloodied",

    actionGroups: [
        {
            name: "weakend-constitution-saving-throw",
            when: {
                stage: { min: 3 },
            },
            actions: [
                {
                    type: "ITEM",
                    when: {
                        items: {
                            has: [
                                "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav"
                            ]
                        }
                    },
                    data: {
                        uuid: "Compendium.transformations.gh-transformations.Item.Uo86wtOs7PMOFlav",
                        mode: "consume",
                        blocker: true,
                        uses: 1
                    }
                },
                {
                    type: "SAVE",
                    data: {
                        ability: "con",
                        dc: "20",
                        key: "weakend-constitution-con-save"
                    }
                },
                {
                    type: "EXHAUSTION",
                    when: {
                        saveFailed: "weakend-constitution-con-save"
                    },
                    data: {
                        mode: "add",
                        value: 1
                    }
                },
                {
                    type: "CHAT",
                    data: {
                        message: "@actor.name gain one level of exhaustion due to their fey forms weakend constitution!"
                    }
                }
            ]
        }
    ]
}
