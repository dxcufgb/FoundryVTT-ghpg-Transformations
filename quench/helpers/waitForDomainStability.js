import { waitForNextFrame } from "./dom.js"

export async function waitForDomainStability({
    actor,
    asyncTrackers
})
{
    await asyncTrackers.whenIdle()
    await waitForNextFrame()
    await waitForNextFrame()
}
