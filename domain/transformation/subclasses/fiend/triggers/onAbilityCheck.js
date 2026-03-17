export const onAbilityCheck = {
    name: "abilityCheck",

    variables: [
        {
            name: "tempHitDieMax",
            type: "formula",
            value: "Math.floor(@highestAvailableHitDiceMax / 2)"
        }
    ],

    actionGroups: [
        {
            name: "prodigious-talent-check",
            when: {
                custom: {
                    abilityCheck: {
                        current: {
                            naturalRoll: [1, 2]
                        }
                    }
                },
                actor: {
                    hasFlag: "fiend.giftOfProdigiousTalent"
                }
            },
            actions: [
                {
                    type: "ACTOR_FLAG",
                    data: {
                        mode: "check",
                        path: "flags.transformations.fiend.giftOfProdigiousTalent",
                        valuePath: "@context.abilityCheck.current.skill",
                        blocker: true
                    }
                },
                {
                    type: "ACTOR_FLAG",
                    data: {
                        mode: "set",
                        path: "flags.transformations.fiend.giftOfProdigiousTalent.longRestsLeftUntilFullHitDieRestoration",
                        valuePath: "@tempHitDieMax"
                    }
                },
                {
                    type: "ACTOR_HIT_DIE",
                    data: {
                        mode: "set",
                        value: "@tempHitDieMax",
                        preferLower: true
                    }
                }
            ]
        }
    ]
}
