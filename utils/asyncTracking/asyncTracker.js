export function createAsyncTracker({ logger })
{
    let pending = new Set()

    function track(promise)
    {
        pending.add(promise)
        promise.finally(() => pending.delete(promise))
        return promise
    }

    function isIdle()
    {
        return pending.size === 0
    }

    function getPendingCount()
    {
        return pending.size
    }

    async function whenIdle()
    {
        while (pending.size > 0) {
            await Promise.allSettled([...pending])
        }
    }

    return Object.freeze({
        track,
        whenIdle,
        isIdle,
        getPendingCount
    })
}