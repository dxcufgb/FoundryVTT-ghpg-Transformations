export function createDebouncedAsyncTracker({
    debounceMs = 50,
    logger
} = {})
{
    let lastPulse = performance.now()
    let timer = null

    function pulse(label = "unknown")
    {
        lastPulse = performance.now()
        if (logger) {
            logger.debug?.("[AsyncPulse]", label)
        }
    }

    async function whenIdle()
    {
        while (true) {
            const elapsed = performance.now() - lastPulse
            if (elapsed >= debounceMs) return
            await new Promise(r => setTimeout(r, debounceMs - elapsed))
        }
    }

    return Object.freeze({
        pulse,
        whenIdle
    })
}