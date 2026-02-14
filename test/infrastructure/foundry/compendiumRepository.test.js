import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCompendiumRepository } from
  "@src/infrastructure/foundry/compendiumRepository.js";

/* -------------------------------------------------- */
/* Helpers                                            */
/* -------------------------------------------------- */

function makePack({ id = "pack.id", docs = [] } = {}) {
  const index = docs.map(d => ({
    _id: d._id,
    name: d.name
  }));

  return {
    id,
    index,
    getIndex: vi.fn(async () => index),
    getDocument: vi.fn(async docId =>
      docs.find(d => d._id === docId) ?? null
    )
  };
}

function makeRepo({ packs = [], fromUuidResult } = {}) {
  const game = {
    packs: new Map(packs.map(p => [p.id, p]))
  };

  const logger = {
    warn: vi.fn(),
    error: vi.fn()
  };

  const fromUuid = vi.fn(async uuid => fromUuidResult?.[uuid]);

  const repo = createCompendiumRepository({
    getGame: () => game,
    fromUuid,
    logger
  });

  return { repo, logger, fromUuid };
}

/* -------------------------------------------------- */
/* Tests                                              */
/* -------------------------------------------------- */

describe("createCompendiumRepository", () => {
  it("loads and caches a compendium pack", async () => {
    const pack = makePack();
    const { repo } = makeRepo({ packs: [pack] });

    const first = await repo.loadPack(pack.id);
    const second = await repo.loadPack(pack.id);

    expect(first).toBe(pack);
    expect(second).toBe(pack);
    expect(pack.getIndex).toHaveBeenCalledTimes(1);
  });

  it("warns and returns null when pack not found", async () => {
    const { repo, logger } = makeRepo();

    const result = await repo.loadPack("missing.pack");

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("resolves document by UUID and caches it", async () => {
    const doc = { id: "doc1" };
    const { repo, fromUuid } = makeRepo({
      fromUuidResult: { "uuid-1": doc }
    });

    const first = await repo.getDocumentByUuid("uuid-1");
    const second = await repo.getDocumentByUuid("uuid-1");

    expect(first).toBe(doc);
    expect(second).toBe(doc);
    expect(fromUuid).toHaveBeenCalledTimes(1);
  });

  it("warns on invalid UUID", async () => {
    const { repo, logger } = makeRepo();

    expect(await repo.getDocumentByUuid(null)).toBeNull();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("handles fromUuid errors gracefully", async () => {
    const logger = { warn: vi.fn(), error: vi.fn() };
    const repo = createCompendiumRepository({
      getGame: () => ({ packs: new Map() }),
      fromUuid: vi.fn(async () => {
        throw new Error("boom");
      }),
      logger
    });

    const result = await repo.getDocumentByUuid("uuid");

    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalled();
  });

  it("gets document from pack by id", async () => {
    const doc = { _id: "doc1", name: "Test" };
    const pack = makePack({ docs: [doc] });

    const { repo } = makeRepo({ packs: [pack] });

    const result = await repo.getDocumentFromPack(pack.id, "doc1");

    expect(result).toBe(doc);
  });

  it("warns when document not found in pack", async () => {
    const pack = makePack();
    const { repo, logger } = makeRepo({ packs: [pack] });

    const result = await repo.getDocumentFromPack(pack.id, "missing");

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("gets document by name from pack", async () => {
    const doc = { _id: "doc1", name: "My Doc" };
    const pack = makePack({ docs: [doc] });

    const { repo } = makeRepo({ packs: [pack] });

    const result = await repo.getDocumentByName(pack.id, "My Doc");

    expect(result).toBe(doc);
  });

  it("warns when document name is not found", async () => {
    const pack = makePack();
    const { repo, logger } = makeRepo({ packs: [pack] });

    const result = await repo.getDocumentByName(pack.id, "Missing");

    expect(result).toBeNull();
    expect(logger.warn).toHaveBeenCalled();
  });
});
