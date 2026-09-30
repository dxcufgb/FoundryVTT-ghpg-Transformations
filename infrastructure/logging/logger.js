// The loggerLevel setting stores these names; numeric levels pass through.
const LOG_LEVEL_NAMES = {
    none: 0,
    error: 1,
    warn: 2,
    warning: 2,
    log: 3,
    info: 4,
    debug: 5
}

export function resolveLogLevel(level, fallback = 2)
{
    if (typeof level === "number" && Number.isFinite(level)) return level
    if (typeof level !== "string") return fallback

    const trimmed = level.trim().toLowerCase()
    if (trimmed in LOG_LEVEL_NAMES) return LOG_LEVEL_NAMES[trimmed]

    const numeric = Number(trimmed)
    return trimmed !== "" && Number.isFinite(numeric) ? numeric : fallback
}

export function createLogger({
    level = 3,
    prefix = "Transformations",
    bootstrapLogger = null
} = {})
{
    bootstrapLogger?.debug?.("createLogger", { level, prefix })
    let actualLevel = resolveLogLevel(level, 3)

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
            actualLevel = resolveLogLevel(level, actualLevel)
        }
    }
}
