export async function expectAsyncWork(fn, {
    trackers,
    timeout = 1000
} = {})
{
    if (typeof fn !== "function") {
        throw new Error("expectAsyncWork requires a function")
    }

    await fn()

    // Wait until all tracked async completes
    await Promise.race([
        trackers.whenIdle(),
        new Promise((_, reject) =>
            setTimeout(
                () => reject(new Error("Timed out waiting for async work")),
                timeout
            )
        )
    ])
}
