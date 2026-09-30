export const onShortRest = {
    name: "shortRest",

    actionGroups: [
        {
            // Enhanced Contract: the active Gift of Damnation can also be
            // switched when finishing a Short Rest.
            name: "enhanced-contract-gift-switch",
            when: {
                items: {
                    has: [
                        "Compendium.transformations.gh-transformations.Item.nAqAkgKH6w6OHQcM"
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
        }
    ]
}
