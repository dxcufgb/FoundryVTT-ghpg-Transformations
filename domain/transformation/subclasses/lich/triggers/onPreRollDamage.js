export const onPreRollDamage = {
    name: "preRollDamage",
    actionGroups: [
        {
            name: "Memori Lichdom weapon damage type",
            when: {
                items: {
                    has: [
                        "Compendium.transformations.gh-transformations.Item.5NEzTu8Y5PGmmCOO"
                    ]
                },
                custom: {
                    damage: {
                        current: {
                            itemDocument: {
                                type: ["weapon"],
                                // Memori Lichdom only works while the soul vessel is charged.
                                actor: {
                                    flags: {
                                        transformations: {
                                            lich: {
                                                soulVesselCharged: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            actions: [
                {
                    type: "ROLL_MODIFIER",
                    data: {
                        mode: "addDamageType",
                        damageType: "force"
                    }
                }
            ]
        }
    ]
}
