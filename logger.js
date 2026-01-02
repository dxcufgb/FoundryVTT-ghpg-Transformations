export class Logger {
    logLevel;

    constructor(logLevel = 1) {
        this.logLevel = logLevel;
    }

    debug(...args) {
        if (this.logLevel = 5) {
            console.debug("Transformations |", ...args);
        }
    }

    info(...args) {
        if (this.logLevel = 4) {
            console.info("Transformations |", ...args);
        }
    }

    log(...args) {
        if (this.logLevel = 3) {
            console.log("Transformations |", ...args);
        }
    }

    warn(...args) {
        if (this.logLevel = 2) {
            console.warn("Transformations |", ...args);
        }
    }

    error(...args) {
        if (this.logLevel = 1) {
            console.error("Transformations |", ...args);
        }
    }

    trace(label, data = {}) {
        console.groupCollapsed(`🧭 ${label}`);
        console.trace();
        console.log(data);
        console.groupEnd();
    }

}

let instance;

export function getLogger(logLevel) {
    if (!instance) {
        instance = new Logger(logLevel);
    }
    return instance;
}