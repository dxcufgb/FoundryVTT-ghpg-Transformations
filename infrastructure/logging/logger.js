export function createLogger({
    level = 3,
    prefix = "Transformations",
    bootstrapLogger = null
} = {})
{
    bootstrapLogger?.debug?.("createLogger", { level, prefix })
    let actualLevel = level

    function enabled(minLevel)
    {
        bootstrapLogger?.debug?.("createLogger.enabled", { minLevel, actualLevel })
        return actualLevel >= minLevel
    }

    return {
        debug(...args)
        {
            if (enabled(5)) {
                console.debug(`${prefix} |`, ...args)
            }
        },

        debugWarn(...args)
        {
            if (enabled(5)) {
                console.warn(`${prefix} |`, ...args)
            }
        },

        info(...args)
        {
            if (enabled(4)) {
                console.info(`${prefix} |`, ...args)
            }
        },

        log(...args)
        {
            if (enabled(3)) {
                console.log(`${prefix} |`, ...args)
            }
        },

        warn(...args)
        {
            if (enabled(2)) {
                console.warn(`${prefix} |`, ...args)
            }
        },

        error(...args)
        {
            if (enabled(1)) {
                console.error(`${prefix} |`, ...args)
            }
        },

        trace(...args)
        {
            if (actualLevel < 4) return
            const err = new Error()
            console.groupCollapsed(`${prefix} | TRACE`, ...args)
            console.trace(err)
            console.groupEnd()
        },

        setLogLevel(level)
        {
            actualLevel = level
        }
    }
}
