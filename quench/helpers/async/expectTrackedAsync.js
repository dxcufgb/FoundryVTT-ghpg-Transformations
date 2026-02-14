export async function expectTrackedAsync(fn, {
    trackers,
    timeout = 1000,
    pollInterval = 5
} = {})
{
    let started = false

    await fn()

    // Wait for async to start
    await Promise.race([
        (async () =>
        {
            while (!started) {
                if (trackers.getRunning().size > 0) {
                    started = true
                    return
                }
                await new Promise(r => setTimeout(r, pollInterval))
            }
        })(),
        new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error("Async work never started")),
                timeout
            )
        )
    ])

    // Then wait for it to finish
    await trackers.whenIdle()
}
