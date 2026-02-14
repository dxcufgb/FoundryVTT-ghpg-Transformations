export async function waitForFoundryStabilization({
    cycles = 2,
    delayMs = 0
} = {})
{
    for (let i = 0; i < cycles; i++) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
        await Promise.resolve() // flush microtasks
    }
}