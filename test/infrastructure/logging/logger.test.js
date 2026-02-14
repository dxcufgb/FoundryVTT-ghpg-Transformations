import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLogger } from "@src/infrastructure/logging/logger.js";

/* ------------------------------------------------------------------ */
/* Console spies                                                       */
/* ------------------------------------------------------------------ */

let spies;

beforeEach(() => {
  spies = {
    debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
    info: vi.spyOn(console, "info").mockImplementation(() => {}),
    log: vi.spyOn(console, "log").mockImplementation(() => {}),
    warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
    error: vi.spyOn(console, "error").mockImplementation(() => {}),
    trace: vi.spyOn(console, "trace").mockImplementation(() => {}),
    groupCollapsed: vi
      .spyOn(console, "groupCollapsed")
      .mockImplementation(() => {}),
    groupEnd: vi.spyOn(console, "groupEnd").mockImplementation(() => {}),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* ------------------------------------------------------------------ */

describe("createLogger", () => {
  it("uses default level 3 and default prefix", () => {
    const logger = createLogger();

    logger.log("hello");

    expect(spies.log).toHaveBeenCalledWith(
      "Transformations |",
      "hello"
    );
  });

  it("does not log debug/info when level is too low", () => {
    const logger = createLogger({ level: 3 });

    logger.debug("nope");
    logger.info("still nope");

    expect(spies.debug).not.toHaveBeenCalled();
    expect(spies.info).not.toHaveBeenCalled();
  });

  it("logs debug and debugWarn at level 5", () => {
    const logger = createLogger({ level: 5, prefix: "Test" });

    logger.debug("debug msg");
    logger.debugWarn("warn msg");

    expect(spies.debug).toHaveBeenCalledWith(
      "Test |",
      "debug msg"
    );

    expect(spies.warn).toHaveBeenCalledWith(
      "Test |",
      "warn msg"
    );
  });

  it("logs info at level 4", () => {
    const logger = createLogger({ level: 4 });

    logger.info("info msg");

    expect(spies.info).toHaveBeenCalledWith(
      "Transformations |",
      "info msg"
    );
  });

  it("logs warn at level 2", () => {
    const logger = createLogger({ level: 2 });

    logger.warn("warn msg");

    expect(spies.warn).toHaveBeenCalledWith(
      "Transformations |",
      "warn msg"
    );
  });

  it("logs error at level 1", () => {
    const logger = createLogger({ level: 1 });

    logger.error("error msg");

    expect(spies.error).toHaveBeenCalledWith(
      "Transformations |",
      "error msg"
    );
  });

  it("does nothing when level is below threshold", () => {
    const logger = createLogger({ level: 1 });

    logger.warn("nope");
    logger.log("nope");
    logger.info("nope");

    expect(spies.warn).not.toHaveBeenCalled();
    expect(spies.log).not.toHaveBeenCalled();
    expect(spies.info).not.toHaveBeenCalled();
  });

  it("supports changing log level at runtime", () => {
    const logger = createLogger({ level: 1 });

    logger.log("ignored");
    expect(spies.log).not.toHaveBeenCalled();

    logger.setLogLevel(3);
    logger.log("now works");

    expect(spies.log).toHaveBeenCalledWith(
      "Transformations |",
      "now works"
    );
  });

  it("emits trace output only when level >= 4", () => {
    const logger = createLogger({ level: 3 });

    logger.trace("trace msg");

    expect(spies.groupCollapsed).not.toHaveBeenCalled();

    logger.setLogLevel(4);
    logger.trace("trace msg");

    expect(spies.groupCollapsed).toHaveBeenCalledWith(
      "Transformations | TRACE",
      "trace msg"
    );
    expect(spies.trace).toHaveBeenCalled();
    expect(spies.groupEnd).toHaveBeenCalled();
  });
});
