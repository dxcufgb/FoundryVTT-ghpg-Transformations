import { waitForActorConsistency } from "./actors.js"
import { waitForNextFrame } from "./dom.js"

export async function advanceStageAndWait({
    actor,
    stage,
    asyncTrackers
})
{
    await actor.setFlag("transformations", "stage", stage)
    await waitForActorConsistency(actor)
    await asyncTrackers.whenIdle()
    await waitForNextFrame()
}