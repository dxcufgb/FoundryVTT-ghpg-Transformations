export class Logger{
    prefix = "Transformations |";
    logLevel;

    constructor(logLevel = 1) {
        this.prefix = this.constructor.prefix;
        this.logLevel = logLevel;
    }
    
    debug(...args) {
        if (this.logLevel = 5) {
            console.debug(prefix, ...args);
        }
    }
    
    info(...args) {
        if (this.logLevel = 4) {
            console.info(prefix, ...args);
        }
    }
    
    log(...args) {
        if (this.logLevel = 3) {
            console.log(prefix, ...args);
        }
    }
    
    warn(...args) {
        if (this.logLevel = 2) {
            console.warn(prefix, ...args);
        }
    }
    
    error(...args) {
        if (this.logLevel = 1) {
            console.error(prefix, ...args);
        }
    }
}

export const errorOnlyLogger = new Logger(1);
export const warningLogger = new Logger(2);
export const logLogger = new Logger(3);
export const infoLogger = new Logger(4);
export const debugLogger = new Logger(5);