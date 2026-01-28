import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCurrentActorResolver } from
  "@src/ui/session/currentActorResolver.js";

describe("createCurrentActorResolver", () => {
  let game;
  let canvas;
  let resolver;

  beforeEach(() => {
    game = {
      actors: {
        getName: vi.fn(),
      },
      user: {
        character: null,
      },
    };

    canvas = {
      tokens: {
        controlled: [],
      },
    };

    resolver = createCurrentActorResolver({
      game,
      canvas,
    });
  });

  it("resolves actor by name when name is provided", () => {
    const actor = { id: "actor-1" };
    game.actors.getName.mockReturnValue(actor);

    const result = resolver.resolve("Bob");

    expect(game.actors.getName)
      .toHaveBeenCalledWith("Bob");
    expect(result).toBe(actor);
  });

  it("resolves to the user's character when no name is provided", () => {
    const actor = { id: "actor-user" };
    game.user.character = actor;

    const result = resolver.resolve();

    expect(result).toBe(actor);
  });

  it("falls back to the first controlled token's actor", () => {
    const actor = { id: "actor-token" };

    canvas.tokens.controlled = [
      { actor },
    ];

    const result = resolver.resolve();

    expect(result).toBe(actor);
  });

  it("returns null when no actor can be resolved", () => {
    const result = resolver.resolve();

    expect(result).toBeNull();
  });
});
