export async function runLoopEvery({
    intervalMs,
    fn,
    signal = null,
    breakFunction
})
{
    if (typeof fn !== "function") {
        throw new Error("runLoopEvery requires a function")
    }

    while (!signal?.aborted && breakFunction()) {
        await fn()
        await new Promise(resolve => setTimeout(resolve, intervalMs))
    }
}
