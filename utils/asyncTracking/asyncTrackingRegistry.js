import { createAsyncTracker } from "./asyncTracker.js"
import { createDebouncedAsyncTracker } from "./debouncedAsyncTracker.js"

export function createAsyncTrackerRegistry({ logger })
{
    const trackers = {}

    // ðŸ†• System-wide debounce tracker
    const debounced = createDebouncedAsyncTracker({
        debounceMs: 50,
        logger
    })

    function get(domain)
    {
        if (!trackers[domain]) {
            trackers[domain] = createAsyncTracker({ logger })
        }
        return trackers[domain]
    }

    function isIdle()
    {
        return (
            Object.values(trackers).every(tracker => tracker.isIdle()) &&
            debounced.isIdle()
        )
    }

    function getRunning()
    {
        const running = Object.entries(trackers)
            .filter(([, tracker]) => !tracker.isIdle())
            .map(([domain]) => domain)

        if (!debounced?.whenIdle()) {
            running.push("debounced")
        }

        return running
    }

    async function whenIdle()
    {
        // 1ï¸âƒ£ wait for all explicit async work
        await Promise.all(
            Object.values(trackers).map(t => t.whenIdle())
        )

        // 2ï¸âƒ£ wait for the system to go quiet
        await debounced.whenIdle()
    }

    return Object.freeze({
        get,
        isIdle,
        getRunning,
        whenIdle,

        // ðŸ†• expose debounce tracker explicitly
        debounced
    })
}