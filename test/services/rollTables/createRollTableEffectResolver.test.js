import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRollTableEffectResolver } from
  "@src/services/rolltables/createRollTableEffectResolver.js";

describe("createRollTableEffectResolver", () => {
  let rollTableEffectCatalog;
  let logger;
  let resolver;
  let deps;

  beforeEach(() => {
    rollTableEffectCatalog = {
      createInstance: vi.fn(),
    };

    logger = {
      warn: vi.fn(),
      debug: vi.fn(),
    };

    deps = {
      rollTableEffectCatalog,
      activeEffectRepository: {},
      constants: {},
      effectChangeBuilder: {},
      actorRepository: {},
      chatService: {},
      stringUtils: {},
      moduleFolderPath: "/module",
      logger,
    };

    resolver = createRollTableEffectResolver(deps);
  });

  /* ------------------------------------------------------------------ */
  /* Guards                                                             */
  /* ------------------------------------------------------------------ */

  it("warns and returns null if actor is missing", () => {
    const result = resolver.resolve({
      actor: null,
      effectKey: "TEST",
    });

    expect(result).toBeNull();

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "rollTableEffectResolver.resolve called without actor"
      );

    expect(rollTableEffectCatalog.createInstance)
      .not.toHaveBeenCalled();
  });

  it("debug logs and returns null if effectKey is missing", () => {
    const result = resolver.resolve({
      actor: { id: "actor-1" },
      effectKey: null,
    });

    expect(result).toBeNull();

    expect(logger.debug)
      .toHaveBeenCalledWith(
        "No effectKey provided, skipping roll table effect"
      );

    expect(rollTableEffectCatalog.createInstance)
      .not.toHaveBeenCalled();
  });

  /* ------------------------------------------------------------------ */
  /* Resolution                                                         */
  /* ------------------------------------------------------------------ */

  it("creates and returns an effect instance", () => {
    const actor = { id: "actor-1" };
    const effect = { apply: vi.fn() };

    rollTableEffectCatalog.createInstance
      .mockReturnValue(effect);

    const result = resolver.resolve({
      actor,
      effectKey: "EFFECT_KEY",
    });

    expect(rollTableEffectCatalog.createInstance)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          constants: deps.constants,
          activeEffectRepository: deps.activeEffectRepository,
          effectChangeBuilder: deps.effectChangeBuilder,
          chatService: deps.chatService,
          actorRepository: deps.actorRepository,
          effectKey: "EFFECT_KEY",
          actor,
          stringUtils: deps.stringUtils,
          moduleFolderPath: deps.moduleFolderPath,
        })
      );

    expect(result).toBe(effect);
  });

  it("warns and returns null if effect key is unknown", () => {
    rollTableEffectCatalog.createInstance
      .mockReturnValue(null);

    const result = resolver.resolve({
      actor: { id: "actor-1" },
      effectKey: "UNKNOWN",
    });

    expect(result).toBeNull();

    expect(logger.warn)
      .toHaveBeenCalledWith(
        "Unknown roll table effect key",
        "UNKNOWN"
      );
  });

  /* ------------------------------------------------------------------ */
  /* Immutability                                                       */
  /* ------------------------------------------------------------------ */

  it("returns a frozen resolver", () => {
    expect(Object.isFrozen(resolver)).toBe(true);
  });
});
