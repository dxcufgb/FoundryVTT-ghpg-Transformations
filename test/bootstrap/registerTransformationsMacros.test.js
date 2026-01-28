import { describe, it, expect, vi, beforeEach } from "vitest";

describe("registerTransformationMacros", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("registers General macros and valid subclass macros", async () => {
    // ─────────────────────────────────────────────────────────────
    // Mocks
    // ─────────────────────────────────────────────────────────────
    const register = vi.fn();
    const macroRegistry = { register };
    const logger = { warn: vi.fn() };

    const validSubclass = {
      handlers: {
        type: "Beast",
        createMacroHandlers: vi.fn()
      }
    };

    const anotherValidSubclass = {
      handlers: {
        type: "Dragon",
        createMacroHandlers: vi.fn()
      }
    };

    // Mock subclasses module
    vi.doMock(
      "@src/domain/transformation/subclasses/index.js",
      () => ({
        Beast: validSubclass,
        Dragon: anotherValidSubclass
      })
    );

    // Mock General handlers factory
    const createGeneralHandlers = vi.fn();
    vi.doMock("@src/macros/createGeneralHandlers.js", () => ({
      createGeneralHandlers
    }));

    // Import AFTER mocks
    const { registerTransformationMacros } = await import(
      "@src/bootstrap/registerTransformtaionsMacros.js"
    );

    // ─────────────────────────────────────────────────────────────
    // Act
    // ─────────────────────────────────────────────────────────────
    registerTransformationMacros({ macroRegistry, logger });

    // ─────────────────────────────────────────────────────────────
    // Assert
    // ─────────────────────────────────────────────────────────────
    expect(register).toHaveBeenCalledTimes(3);

    expect(register).toHaveBeenCalledWith({
      type: "General",
      createHandlers: createGeneralHandlers
    });

    expect(register).toHaveBeenCalledWith({
      type: "Beast",
      createHandlers: validSubclass.handlers.createMacroHandlers
    });

    expect(register).toHaveBeenCalledWith({
      type: "Dragon",
      createHandlers: anotherValidSubclass.handlers.createMacroHandlers
    });

    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("logs a warning and skips invalid subclass exports", async () => {
    const register = vi.fn();
    const macroRegistry = { register };
    const logger = { warn: vi.fn() };

    const invalidSubclass = {
      handlers: {
        // missing type and createMacroHandlers
      }
    };

    vi.doMock(
      "@src/domain/transformation/subclasses/index.js",
      () => ({
        Broken: invalidSubclass
      })
    );

    const createGeneralHandlers = vi.fn();
    vi.doMock("@src/macros/createGeneralHandlers.js", () => ({
      createGeneralHandlers
    }));

    const { registerTransformationMacros } = await import(
      "@src/bootstrap/registerTransformtaionsMacros.js"
    );

    registerTransformationMacros({ macroRegistry, logger });

    // General still registered
    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith({
      type: "General",
      createHandlers: createGeneralHandlers
    });

    // Invalid subclass skipped
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid transformation subclass macro export",
      invalidSubclass.handlers
    );
  });
});
