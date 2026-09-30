/**
 * Dev helper: writes the flags from flags/*.flags.js onto the compendium documents.
 * Only run manually (TransformationsDev.applyFlags()) with the pack unlocked.
 */
export async function applyTransformationFlags(entries, { dryRun = false } = {})
{
    for (const entry of entries) {
        const { uuid, flags } = entry

        try {
            const doc = await fromUuid(uuid)
            if (!doc) {
                console.warn(`Document not found: ${uuid}`)
                continue
            }

            const pack = doc.pack ? game.packs.get(doc.pack) : null
            if (pack?.locked) {
                console.warn(`Skipping ${doc.name}: compendium ${pack.collection} is locked`)
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
        } catch (error) {
            console.error(`Failed to apply transformation flags to ${uuid}`, error)
        }
    }
}
