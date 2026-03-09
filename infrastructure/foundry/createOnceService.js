export function createOnceService({
    logger
})
{
    logger.debug("createOnceService")
    async function setOnceFlag(actor, once)
    {
        const onceFlags = actor.getFlag("transformations", "once") ?? {}
        const resetList = Array.isArray(once.reset)
            ? once.reset
            : once.reset
                ? [once.reset]
                : []

        onceFlags[once.key] = {
            executed: true,
            reset: resetList
        }
        await actor.setFlag("transformations", "once", onceFlags)
    }

    function hasOnceBeenExecuted(actor, key)
    {
        const onceFlags = actor.getFlag("transformations", "once") ?? {}
        const entry = onceFlags[key]

        return (entry?.executed === true)
    }

    async function resetFlagsOnRest(actor, restTypes)
    {
        const { isLong, isShort } = restTypes
        const onceFlags = actor.getFlag("transformations", "once")
        if (onceFlags) {
            const updated = { ...onceFlags }
            let changed = false

            for (const [key, entry] of Object.entries(updated)) {

                if (!Array.isArray(entry.reset)) continue

                const shouldReset =
                    (isLong && entry.reset.includes("longRest")) ||
                    (isShort && entry.reset.includes("shortRest"))

                if (shouldReset) {
                    delete updated[key]
                    changed = true
                }
            }

            if (changed) {
                if (Object.keys(updated).length === 0) {
                    await actor.unsetFlag("transformations", "once")
                } else {
                    await actor.setFlag("transformations", "once", updated)
                }
            }
        }
    }

    return {
        setOnceFlag,
        hasOnceBeenExecuted,
        resetFlagsOnRest
    }
}