export const onInitiative = {
    name: "initiative",

    actionGroups: [
        {
            name: "hideous-appearance-save",
            when: {
                effect: {
                    has: ["Aberrant Confusion"]
                }
            },
            actions: [
                {
                    type: "EFFECT",
                    data: {
                        mode: "toggle",
                        name: "stunned",
                        active: true,
                    }
                },
                {
                    type: "CHAT",
                    data: {
                        message: "Due to Aberrant Confusion @actor.name is stunned for the first round!"
                    }
                }
            ]
        }
    ]
}