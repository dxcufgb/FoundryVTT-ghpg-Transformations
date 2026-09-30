
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
                        transformationType: "aberrantHorror",
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
                actor: {hasFlag: "aberrantHorror.tookDamage"}
            },
            actions: [
                {
                    type: "APPLY_ROLLTABLE",

                    data: {
                        uuid: "Compendium.transformations.gh-roll-tables.RollTable.NcOgsdD3d4dassuY",
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
                actor: {hasFlag: "aberrantHorror.tookDamage"}
            },
            actions: [

                {
                    type: "APPLY_ROLLTABLE",
                    data: {
                        uuid: "Compendium.transformations.gh-roll-tables.RollTable.bHA1uo22DkMiJJuG",
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
                actor: {hasFlag: "aberrantHorror.tookDamage"}
            },
            actions: [

                {
                    type: "APPLY_ROLLTABLE",
                    data: {
                        uuid: "Compendium.transformations.gh-roll-tables.RollTable.7M7eNAAjMGQhSiVY",
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
                actor: {hasFlag: "aberrantHorror.tookDamage"}
            },
            actions: [

                {
                    type: "APPLY_ROLLTABLE",
                    data: {
                        uuid: "Compendium.transformations.gh-roll-tables.RollTable.bBA81xCQndyJAIPi",
                        displayChat: true,
                        storeResultFlag: "unstableForm"
                    }
                },
            ]
        },
        {
            name: "clear-damage-taken",
            when: {
                actor: {hasFlag: "aberrantHorror.tookDamage"}
            },
            actions: [
                {
                    type: "ACTOR_FLAG",
                    data: {
                        mode: "remove",
                        key: "aberrantHorror.tookDamage"
                    }
                }
            ]
        }
    ]
}
