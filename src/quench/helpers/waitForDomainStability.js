import { waitForNextFrame } from "./dom.js"

export async function waitForDomainStability({
    actor,
    asyncTrackers
})
{
    // Wait for tracked async
    await asyncTrackers.whenIdle()

    // Let Foundry flush document updates
    await waitForNextFrame()

    // Ensure actor re-prepared
    actor.prepareData?.()

    // One more frame to flush cascading updates
    await waitForNextFrame()
}
