import { describe, it, expect, vi, beforeEach } from "vitest";
import { createActiveEffectRepository } from
  "@src/infrastructure/foundry/activeEffectsRepository.js";
  
function makeEffect({ id, name, origin, flags = {} }) {
  return {
    id,
    name,
    origin,
    getFlag: (scope, key) => flags?.[scope]?.[key]
  };
}

function makeActor(effects = []) {
  const effectMap = new Map(
    effects.map(e => [e.id, e])
  );

  return {
    id: "actor-1",
    effects: Object.assign([...effectMap.values()], {
      get: id => effectMap.get(id),
      has: id => effectMap.has(id),
      find: fn => [...effectMap.values()].find(fn),
      filter: fn => [...effectMap.values()].filter(fn)
    }),
    createEmbeddedDocuments: vi.fn(async (_type, docs) =>
      docs.map((d, i) => ({
        id: `new-${i}`,
        ...d
      }))
    ),
    deleteEmbeddedDocuments: vi.fn(async () => {})
  };
}

describe("createActiveEffectRepository", () => {
  let logger;
  let repo;

  beforeEach(() => {
    logger = {
      trace: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn()
    };

    repo = createActiveEffectRepository({ logger });
  });

  it("getAll returns empty array when actor is missing", () => {
    expect(repo.getAll(null)).toEqual([]);
  });

  it("finds effect by name", () => {
    const actor = makeActor([
      makeEffect({ id: "1", name: "Stunned" })
    ]);

    const effect = repo.findByName(actor, "Stunned");

    expect(effect?.id).toBe("1");
    expect(logger.trace).toHaveBeenCalled();
  });

  it("finds effect by id", () => {
    const actor = makeActor([
      makeEffect({ id: "abc", name: "Poisoned" })
    ]);

    expect(repo.findById(actor, "abc")?.name).toBe("Poisoned");
  });

  it("finds effect by source UUID", () => {
    const actor = makeActor([
      makeEffect({ id: "1", origin: "uuid-123" })
    ]);

    expect(repo.findBySourceUuid(actor, "uuid-123")?.id).toBe("1");
  });

  it("checks for any effect by name", () => {
    const actor = makeActor([
      makeEffect({ id: "1", name: "A" })
    ]);

    expect(repo.hasAnyByName(actor, ["A", "B"])).toBe(true);
  });

  it("gets ids by name", () => {
    const actor = makeActor([
      makeEffect({ id: "1", name: "A" }),
      makeEffect({ id: "2", name: "A" })
    ]);

    expect(repo.getIdsByName(actor, "A")).toEqual(["1", "2"]);
  });

  it("creates an active effect on actor", async () => {
    const actor = makeActor();

    const effect = await repo.create({
      actor,
      name: "Test Effect",
      description: "desc",
      changes: []
    });

    expect(actor.createEmbeddedDocuments).toHaveBeenCalled();
    expect(effect.name).toBe("Test Effect");
  });

  it("warns and returns null if create called without actor or name", async () => {
    const result = await repo.create({});

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("removes effects by ids", async () => {
    const actor = makeActor([
      makeEffect({ id: "1", name: "A" }),
      makeEffect({ id: "2", name: "B" })
    ]);

    await repo.removeByIds(actor, ["1"]);

    expect(actor.deleteEmbeddedDocuments).toHaveBeenCalledWith(
      "ActiveEffect",
      ["1"]
    );
  });

  it("removes effects flagged for removal on long rest", async () => {
    const actor = makeActor([
      makeEffect({
        id: "1",
        flags: { transformations: { removeOnLongRest: true } }
      }),
      makeEffect({ id: "2" })
    ]);

    await repo.removeEffectsOnLongRest(actor);

    expect(actor.deleteEmbeddedDocuments).toHaveBeenCalledWith(
      "ActiveEffect",
      ["1"]
    );
  });
});
