import { describe, it, expect, vi, beforeEach } from "vitest";
import { createActorRepository } from
  "@src/infrastructure/foundry/actorRepository.js";

/* -------------------------------------------------- */
/* Global mocks Foundry normally provides              */
/* -------------------------------------------------- */

global.fromUuid = vi.fn();
global.CONST = {
  ACTIVE_EFFECT_MODES: { ADD: 2 }
};

global.foundry = {
  utils: {
    getProperty: (obj, path) =>
      path.split(".").reduce((o, k) => o?.[k], obj)
  }
};

Math.clamp ??= (v, min, max) => Math.min(max, Math.max(min, v));

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function makeActor(overrides = {}) {
  return {
    id: "actor-1",
    system: {
      attributes: {
        hp: { value: 10, max: 20, temp: 0 },
        exhaustion: 0,
        movement: {}
      }
    },
    flags: { dnd5e: {}, transformations: {} },
    update: vi.fn(async () => {}),
    getFlag: vi.fn((s, k) => overrides.flags?.[s]?.[k]),
    setFlag: vi.fn(async () => {}),
    unsetFlag: vi.fn(async () => {}),
    ...overrides
  };
}

function makeRepo({ actor } = {}) {
  const game = {
    actors: new Map([[actor?.id, actor]])
  };

  const logger = {
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn()
  };

  const repo = createActorRepository({
    getGame: () => game,
    logger
  });

  return { repo, logger };
}

/* -------------------------------------------------- */
/* Tests                                              */
/* -------------------------------------------------- */

describe("createActorRepository", () => {
  it("gets actor by id", () => {
    const actor = makeActor();
    const { repo } = makeRepo({ actor });

    expect(repo.getById("actor-1")).toBe(actor);
    expect(repo.getById("missing")).toBeNull();
  });

  it("resolves actor by UUID", async () => {
    const actor = makeActor({ documentName: "Actor" });
    fromUuid.mockResolvedValue(actor);

    const { repo } = makeRepo();

    const result = await repo.getByUuid("uuid");
    expect(result).toBe(actor);
  });

  it("returns null when UUID resolves to non-actor", async () => {
    fromUuid.mockResolvedValue({ documentName: "Item" });
    const { repo } = makeRepo();

    expect(await repo.getByUuid("uuid")).toBeNull();
  });

  it("gets transformation id and stage", () => {
    const actor = makeActor({
      flags: { dnd5e: { transformations: "tid", transformationStage: 2 } }
    });

    const { repo } = makeRepo({ actor });

    expect(repo.getActiveTransformationId(actor)).toBe("tid");
    expect(repo.getTransformationStage(actor)).toBe(2);
  });

  it("sets and clears macro execution flags", async () => {
    const actor = makeActor({
      getFlag: vi.fn(() => ({}))
    });

    const { repo } = makeRepo({ actor });

    await repo.setMacroExecution(actor, "test");
    expect(actor.setFlag).toHaveBeenCalled();

    expect(repo.hasMacroExecution(actor, "test")).toBe(false);
  });

  it("resolves actors from tokens", () => {
    const actor = makeActor();
    const token = { isToken: true, actor };

    const { repo } = makeRepo();
    expect(repo.resolveActor(token)).toBe(actor);
  });

  it("adds exhaustion with clamping", async () => {
    const actor = makeActor({
      system: { attributes: { exhaustion: 5 } }
    });

    const { repo } = makeRepo({ actor });

    await repo.addExhaustionLevels(actor, 5);
    expect(actor.update).toHaveBeenCalledWith({
      "system.attributes.exhaustion": 6
    });
  });

  it("updates HP correctly", async () => {
    const actor = makeActor();
    const { repo } = makeRepo({ actor });

    await repo.addHp(actor, 5);
    expect(actor.update).toHaveBeenCalled();

    await repo.applyDamage(actor, 20);
    expect(actor.update).toHaveBeenCalled();
  });

  it("sets temp HP to max of current vs amount", async () => {
    const actor = makeActor({
      system: { attributes: { hp: { temp: 5 } } }
    });

    const { repo } = makeRepo({ actor });

    await repo.addTempHp(actor, 3);
    expect(actor.update).toHaveBeenCalledWith({
      "system.attributes.hp.temp": 5
    });
  });

  it("generates numeric effect changes", () => {
    const actor = makeActor({
      system: {
        abilities: { str: 1, dex: 0 }
      }
    });

    const { repo } = makeRepo();

    const effects = repo.getNumericAttributeEffectChanges(actor, {
      basePath: "abilities",
      bonus: 2
    });

    expect(effects).toEqual([
      { key: "abilities.str", mode: 2, value: 2 }
    ]);
  });

  it("sets movement bonus", async () => {
    const actor = makeActor();
    const { repo } = makeRepo({ actor });

    await repo.setMovementBonus(actor, 10);
    expect(actor.update).toHaveBeenCalledWith({
      "system.attributes.movement.bonus": "10"
    });
  });
});
