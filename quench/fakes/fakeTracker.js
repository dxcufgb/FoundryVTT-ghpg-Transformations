export function createFakeTracker()
{

    let pending = 0
    let idleResolvers = []

    function resolveIfIdle()
    {
        if (pending === 0) {
            idleResolvers.forEach(r => r())
            idleResolvers = []
        }
    }

    return {

        async track(promise)
        {
            pending++
            try {
                return await promise
            } finally {
                pending--
                resolveIfIdle()
            }
        },

        whenIdle()
        {
            if (pending === 0) return Promise.resolve()

            return new Promise(resolve =>
            {
                idleResolvers.push(resolve)
            })
        }
    }
}
