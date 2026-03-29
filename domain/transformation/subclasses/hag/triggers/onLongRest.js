
export const onLongRest = {
    name: "longRest",
    actionGroups: [
        {
            name: "remove-aberrant-effects",
            actions: [
                {
                    type: "MACRO",
                    data: {
                        trigger: "transformations.onLongRest",
                        transformationType: "General",
                        action: "removeOnLongRest",
                        args: {}
                    }
                },
                {
                    type: "MACRO",
                    data: {
                        trigger: "transformations.onLongRest",
                        transformationType: "hag",
                        action: "removeAberrantMutationEffects",
                        args: {}
                    }
                },
            ]
        },
        {
            name: "unstable-form-stage-1",
            when: {
                stage: [1],
            },
            actions: [
                {
                    type: "APPLY_ROLLTABLE",

                    data: {
                        uuid: "",
                        displayChat: true,
                        storeResultFlag: "unstableForm"
                    }
                },
            ]

        },
        {
            name: "unstable-form-stage-2",
            when: {
                stage: [2],
            },
            actions: [

                {
                    type: "APPLY_ROLLTABLE",
                    data: {
                        uuid: "",
                        displayChat: true,
                        storeResultFlag: "unstableForm"
                    }
                },
            ]

        },
        {
            name: "unstable-form-stage-3",
            when: {
                stage: [3],
            },
            actions: [

                {
                    type: "APPLY_ROLLTABLE",
                    data: {
                        uuid: "",
                        displayChat: true,
                        storeResultFlag: "unstableForm"
                    }
                },
            ]
        },
        {
            name: "unstable-form-stage-4",
            when: {
                stage: [4],
            },
            actions: [

                {
                    type: "APPLY_ROLLTABLE",
                    data: {
                        uuid: "",
                        displayChat: true,
                        storeResultFlag: "unstableForm"
                    }
                },
            ]
        }
    ]
}