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

let instance;

export function getLogger(logLevel) {
  if (!instance) {
    instance = new Logger(logLevel);
  }
  return instance;
}