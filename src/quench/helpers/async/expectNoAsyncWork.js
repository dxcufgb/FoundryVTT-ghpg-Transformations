export async function expectNoAsyncWork(fn, {
    trackers
} = {})
{
    await fn()

    if (trackers.getRunning().size > 0) {
        throw new Error("Expected no async work, but async tasks were scheduled")
    }
}
