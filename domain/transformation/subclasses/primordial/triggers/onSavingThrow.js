const PRIMORDIAL_CHAOS_UUID =
          "Compendium.transformations.gh-transformations.Item.lYYCNPIBVXMQ5fAg"

export const onSavingThrow = {
    name: "savingThrow",

    actionGroups: [
        {
            name: "trigger primordial chaos on natural 1 saving throw",
            when: {
                items: {
                    has: [PRIMORDIAL_CHAOS_UUID]
                },
                custom: {
                    saves: {
                        current: {
                            naturalRoll: 1
                        }
                    }
                }
            },
            actions: [
                {
                    type: "ITEM_ACTIVITY",
                    data: {
                        itemUuid: PRIMORDIAL_CHAOS_UUID,
                        activityId: "atkAWEqTesrELCv8"
                    }
                }
            ]
        }
    ]
}
