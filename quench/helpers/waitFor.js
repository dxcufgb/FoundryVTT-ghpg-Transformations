export async function waitFor({
    predicate,
    timeout = 3000,
    interval = 25,
    errorMessage = "waitFor timed out"
})
{
    const start = Date.now()

    return new Promise((resolve, reject) =>
    {
        const check = async () =>
        {
            try {
                const result = await predicate()
                if (result) return resolve(result)
            } catch (err) {
                // swallow predicate errors until timeout
            }

            if (Date.now() - start > timeout) {
                return reject(new Error(errorMessage))
            }

            setTimeout(check, interval)
        }

        check()
    })
}
