const FRAYING_REALITY_ITEM_UUID =
    "Compendium.transformations.gh-transformations.Item.daxJPuEvp9ATh0Lq"
const FRAYING_REALITY_ACTIVITY_NAME = "Midi Save"

export const onBloodied = {
    name: "bloodied",
    actionGroups: [
        {
            name: "fraying-reality-saving-throw",
            when: {
                items: {
                    has: [FRAYING_REALITY_ITEM_UUID],
                    usesRemaining: {
                        min: 1,
                        max: 1
                    }
                }
            },
            actions: [
                {
                    type: "ITEM",
                    data: {
                        uuid: FRAYING_REALITY_ITEM_UUID,
                        mode: "consume",
                        blocker: true,
                        uses: 1
                    }
                },
                {
                    type: "ITEM_ACTIVITY",
                    data: {
                        itemUuid: FRAYING_REALITY_ITEM_UUID,
                        activityName: FRAYING_REALITY_ACTIVITY_NAME,
                        blocker: true
                    }
                }
            ]
        }
    ]
}
