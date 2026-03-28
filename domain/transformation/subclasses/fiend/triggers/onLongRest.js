export const onLongRest = {
    name: "longRest",

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
                actor: {
                    hasFlag: "fiend.giftOfProdigiousTalent"
                }
            },
            actions: [
                {
                    type: "ACTOR_FLAG",
                    data: {
                        mode: "check",
                        path: "flags.transformations.fiend.giftOfProdigiousTalent.longRestsLeftUntilFullHitDieRestoration",
                        expression: "@currentValue > 0",
                        blocker: true
                    }
                },
                {
                    type: "ACTOR_FLAG",
                    data: {
                        mode: "set",
                        path: "flags.transformations.fiend.giftOfProdigiousTalent.longRestsLeftUntilFullHitDieRestoration",
                        expression: "@currentValue -1"
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