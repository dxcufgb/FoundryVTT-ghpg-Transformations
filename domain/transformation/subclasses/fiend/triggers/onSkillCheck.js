export const onSkillCheck = {
    name: "skillCheck",

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
                    checks: {
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
                        path: "flags.transformations.fiend.giftOfProdigiousTalent.skills",
                        valuePath: "@context.checks.current.skill",
                        blocker: true
                    }
                },
                {
                    type: "ACTOR_FLAG",
                    data: {
                        mode: "set",
                        path: "flags.transformations.fiend.giftOfProdigiousTalent.longRestsLeftUntilFullHitDieRestoration",
                        value: 2
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
