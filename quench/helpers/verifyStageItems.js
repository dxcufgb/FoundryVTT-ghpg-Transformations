export function assertExpectedItems({ expectedItems, actor, expect })
{
    for (const expectedItem of expectedItems) {
        const grantedUuid = expectedItem.uuid

        const item = actor.items.find(i => i.flags?.transformations?.sourceUuid === grantedUuid)

        expect(
            item,
            `Missing granted item from stage: ${grantedUuid}`
        ).to.exist

        // replacement sanity check
        if (item.replaces?.uuid) {
            const replaced = actor.items.find(
                i => i.flags.transformations.sourceUuid === item.replaces.uuid
            )

            expect(
                replaced,
                `Replaced item still present: ${item.replaces.uuid}`
            ).to.not.exist
        }
    }
}