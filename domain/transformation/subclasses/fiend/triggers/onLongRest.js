export const onLongRest = {
    name: "longRest",

    variables: [
        {
            name: "tempHitDieMax",
            type: "formula",
            value: "@highestAvailableHitDiceMax - Math.floor(@highestAvailableHitDiceMax / 2)"
        }
    ],
    
    actionGroups: [
        {
            // Devilish Contractor: finishing a Long Rest allows swapping one
            // active Gift of Damnation for another gift of a signed contract.
            name: "devilish-contractor-gift-switch",
            when: {
                items: {
                    has: [
                        "Compendium.transformations.gh-transformations.Item.fF8Z7O4xTaVtiuFf"
                    ]
                }
            },
            actions: [
                {
                    type: "ACTOR_FLAG",
                    data: {
                        mode: "set",
                        path: "flags.transformations.fiendContracts.switchAvailable",
                        value: true
                    }
                }
            ]
        },
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
                    // Only keep the cap while Long Rests remain; the
                    // dice return once the second Long Rest is finished.
                    type: "ACTOR_FLAG",
                    data: {
                        mode: "check",
                        path: "flags.transformations.fiend.giftOfProdigiousTalent.longRestsLeftUntilFullHitDieRestoration",
                        expression: "@currentValue > 0",
                        blocker: true
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