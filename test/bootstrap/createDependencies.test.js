import { describe, it, expect } from "vitest";
import { createDependencies } from "@src/bootstrap/createDependencies.js";

describe("createDependencies", () => {
  it("returns an object containing the provided dependencies", () => {
    const game = { id: "game" };
    const constants = { A: 1 };
    const utils = { doThing: () => {} };
    const logger = { log: () => {} };

    const result = createDependencies({
      game,
      constants,
      utils,
      logger
    });

    expect(result).toEqual({
      game,
      constants,
      utils,
      logger
    });
  });

  it("preserves reference identity for all dependencies", () => {
    const game = {};
    const constants = {};
    const utils = {};
    const logger = {};

    const result = createDependencies({
      game,
      constants,
      utils,
      logger
    });

    expect(result.game).toBe(game);
    expect(result.constants).toBe(constants);
    expect(result.utils).toBe(utils);
    expect(result.logger).toBe(logger);
  });

  it("does not add unexpected properties", () => {
    const result = createDependencies({
      game: null,
      constants: null,
      utils: null,
      logger: null
    });

    expect(Object.keys(result).sort()).toEqual([
      "constants",
      "game",
      "logger",
      "utils"
    ]);
  });
});
