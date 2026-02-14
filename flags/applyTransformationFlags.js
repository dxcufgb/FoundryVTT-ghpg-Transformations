export async function applyTransformationFlags(entries, { dryRun = false } = {})
{
    for (const entry of entries) {
        const { uuid, flags } = entry

        const doc = await fromUuid(uuid)
        if (!doc) {
            console.warn(`Document not found: ${uuid}`)
            continue
        }

        if (dryRun) {
            console.log(`[DRY RUN] Would apply flags to ${doc.name}`, flags)
            continue
        }

        await doc.update({
            "flags.transformations": null
        })

        await doc.update({
            flags
        })

        console.log(`Applied transformation flags to ${doc.name}`, flags)
    }
}