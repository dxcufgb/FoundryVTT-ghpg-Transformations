export const onInitiative = {
    name: "initiative",

    actionGroups: [
        {
            name: "aberrant-confusion-stun",
            when: {
                effects: {
                    has: ["Aberrant Confusion"]
                }
            },
            actions: [
                {
                    type: "EFFECT",
                    data: {
                        mode: "create",
                        name: "Aberrant Confusion: Stunned",
                        icon: "modules/transformations/Icons/Transformations/Aberrant%20Horror/Unstable_Form.png",
                        statuses: ["stunned"],
                        changes: [],
                        // Stunned only until the end of the actor's first turn.
                        duration: {
                            rounds: 1
                        },
                        flags: {
                            dae: {
                                specialDuration: ["turnEnd"]
                            }
                        }
                    }
                },
                {
                    type: "CHAT",
                    data: {
                        message: "Due to Aberrant Confusion @actor.name is stunned until the end of their first turn!"
                    }
                }
            ]
        }
    ]
}
