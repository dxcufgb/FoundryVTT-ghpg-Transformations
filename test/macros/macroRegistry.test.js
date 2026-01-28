import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMacroRegistry } from
  "@src/macros/macroRegistry.js";

describe("createMacroRegistry", () => {
  let logger;
  let registry;

  beforeEach(() => {
    logger = {
      debug: vi.fn(),
      warn: vi.fn(),
    };

    registry = createMacroRegistry({ logger });
  });

  /* ------------------------------------------------------------------ */
  /* Factory                                                            */
  /* ------------------------------------------------------------------ */

  it("returns a frozen registry", () => {
    expect(Object.isFrozen(registry)).toBe(true);
  });

  it("exposes register and get functions", () => {
    expect(typeof registry.register).toBe("function");
    expect(typeof registry.get).toBe("function");
  });

  /* ------------------------------------------------------------------ */
  /* register                                                           */
  /* ------------------------------------------------------------------ */

  it("throws if type is missing", () => {
    expect(() =>
      registry.register({ createHandlers: vi.fn() })
    ).toThrow("Macro registry entry requires type");
  });

  it("throws if createHandlers is not a function", () => {
    expect(() =>
      registry.register({ type: "wolf" })
    ).toThrow(
      "Macro registry entry 'wolf' is missing createHandlers"
    );
  });

  it("registers a macro entry", () => {
    const createHandlers = vi.fn();

    registry.register({
      type: "wolf",
      createHandlers,
    });

    const entry = registry.get("wolf");

    expect(entry).toEqual({
      type: "wolf",
      createHandlers,
    });

    expect(Object.isFrozen(entry)).toBe(true);

    expect(logger.debug)
      .toHaveBeenCalledWith(
        "Macro registry registered",
        "wolf"
      );
  });

  it("warns and ignores duplicate registrations", () => {
    const createHandlers = vi.fn();

    registry.register({
      type: "wolf",
      createHandlers,
    });

    registry.register({
      type: "wolf",
      createHandlers,
    });

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Macro registry entry already exists",
        "wolf"
      );
  });

  /* ------------------------------------------------------------------ */
  /* get                                                                */
  /* ------------------------------------------------------------------ */

  it("returns null for unknown types", () => {
    expect(registry.get("unknown")).toBeNull();
  });
});
