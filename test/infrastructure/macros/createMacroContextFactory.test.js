import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMacroContextFactory } from "@src/infrastructure/macros/createMacroContextFactory.js";

describe("createMacroContextFactory", () => {
  let logger;
  let factory;

  beforeEach(() => {
    logger = {
      warn: vi.fn(),
    };

    factory = createMacroContextFactory({ logger });
  });

  /* ------------------------------------------------------------------ */
  /* Failure cases                                                       */
  /* ------------------------------------------------------------------ */

  it("returns null and warns when token is missing", () => {
    const result = factory.createFromToken(null);

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith(
      "MacroContextFactory: token missing"
    );
  });

  it("returns null and warns when token has no actor", () => {
    const token = {
      id: "token-1",
    };

    const result = factory.createFromToken(token);

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith(
      "MacroContextFactory: token has no actor",
      "token-1"
    );
  });

  /* ------------------------------------------------------------------ */
  /* Success case                                                        */
  /* ------------------------------------------------------------------ */

  it("creates a frozen macro context from a valid token", () => {
    const token = {
      id: "token-1",
      x: 100,
      y: 200,
      elevation: 5,
      scene: { id: "scene-1" },
      actor: {
        id: "actor-1",
        name: "Boblin",
        type: "goblin",
      },
    };

    const context = factory.createFromToken(token);

    expect(context).toEqual({
      tokenId: "token-1",
      actorId: "actor-1",
      sceneId: "scene-1",

      position: {
        x: 100,
        y: 200,
      },

      elevation: 5,

      actor: {
        name: "Boblin",
        type: "goblin",
      },
    });

    expect(Object.isFrozen(context)).toBe(true);
  });

  it("defaults sceneId to null and elevation to 0 when missing", () => {
    const token = {
      id: "token-2",
      x: 0,
      y: 0,
      actor: {
        id: "actor-2",
        name: "Alice",
        type: "wizard",
      },
    };

    const context = factory.createFromToken(token);

    expect(context.sceneId).toBeNull();
    expect(context.elevation).toBe(0);
  });
});
