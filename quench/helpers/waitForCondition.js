export async function waitForCondition(
    predicate,
    {
        timeout = 2000,
        interval = 10,
        errorMessage = "Timed out waiting for condition"
    } = {}
)
{
    const start = Date.now()

    while (Date.now() - start < timeout) {
        if (predicate()) return

        await new Promise(r => setTimeout(r, interval))
    }

    throw new Error(errorMessage)
}