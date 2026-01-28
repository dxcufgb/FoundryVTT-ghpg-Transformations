import { describe, it, expect, vi } from "vitest";
import { createItemRepository } from
  "@src/infrastructure/foundry/itemRepository.js";
import { makeActor } from "../../helpers/actorHelper.js";
import { makeItem } from "../../helpers/itemHelper.js";

describe("createItemRepository", () => {
  const logger = {
    trace: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn()
  };

  const repo = createItemRepository({ logger });

  describe("query helpers", () => {
    it("findEmbeddedById returns item or null", () => {
      const item = makeItem({ id: "a" });
      const actor = makeActor({ items: new Map([["a", item]]) });

      expect(repo.findEmbeddedById(actor, "a")).toBe(item);
      expect(repo.findEmbeddedById(actor, "x")).toBeNull();
    });

    it("findEmbeddedByUuidFlag finds by sourceUuid flag", () => {
      const item = makeItem({
        flags: { transformations: { sourceUuid: "u1" } }
      });
      const actor = makeActor({ items: [item] });

      expect(repo.findEmbeddedByUuidFlag(actor, "u1")).toBe(item);
    });

    it("getEmbeddedAddedByTransformation filters correctly", () => {
      const a = makeItem({
        flags: { transformations: { addedByTransformation: true } }
      });
      const b = makeItem();

      const actor = makeActor({ items: [a, b] });

      expect(repo.getEmbeddedAddedByTransformation(actor)).toEqual([a]);
    });

    it("findEmbeddedByType finds first matching type", () => {
      const race = makeItem({ type: "race" });
      const actor = makeActor({ items: [race] });

      expect(repo.findEmbeddedByType(actor, "race")).toBe(race);
    });
  });

  describe("uses helpers", () => {
    it("getRemainingUses returns remaining count", () => {
      const item = makeItem({
        system: { uses: { max: 3, spent: 1 } }
      });

      expect(repo.getRemainingUses(item)).toBe(2);
    });

    it("consumeUses updates spent when possible", async () => {
      const item = makeItem({
        system: { uses: { max: 3, spent: 1 } }
      });

      const result = await repo.consumeUses(item, 2);
      expect(result).toBe(true);
      expect(item.update).toHaveBeenCalledWith({
        "system.uses.spent": 3
      });
    });

    it("consumeUses fails when insufficient", async () => {
      const item = makeItem({
        system: { uses: { max: 1, spent: 1 } }
      });

      expect(await repo.consumeUses(item, 1)).toBe(false);
    });
  });

  describe("addTransformationItem", () => {
    it("returns existing item when duplicate exists", async () => {
      const existing = makeItem({
        flags: { transformations: { sourceUuid: "u1" } }
      });

      const actor = makeActor({ items: [existing] });

      const result = await repo.addTransformationItem({
        actor,
        sourceItem: { uuid: "u1" }
      });

      expect(result).toBe(existing);
    });

    it("removes replaced item and creates new one", async () => {
      const oldItem = makeItem({
        uuid: "old",
        flags: { transformations: { sourceUuid: "old" } }
      });

      const actor = makeActor({ items: [oldItem] });

      const sourceItem = {
        uuid: "new",
        toObject: () => ({})
      };

      await repo.addTransformationItem({
        actor,
        sourceItem,
        context: { definitionId: "d", stage: 1 },
        replacesUuid: "old"
      });

      expect(oldItem.delete).toHaveBeenCalled();
      expect(actor.createEmbeddedDocuments).toHaveBeenCalled();
    });
  });

  describe("remove helpers", () => {
    it("removeTransformationItems deletes only transformation items", async () => {
      const a = makeItem({
        id: "1",
        flags: { transformations: { addedByTransformation: true } }
      });
      const b = makeItem({ id: "2" });

      const actor = makeActor({ items: [a, b] });

      await repo.removeTransformationItems(actor);

      expect(actor.deleteEmbeddedDocuments).toHaveBeenCalledWith(
        "Item",
        ["1"]
      );
    });

    it("removeBySourceUuid deletes matching items", async () => {
      const a = makeItem({
        id: "1",
        flags: { transformations: { sourceUuid: "x" } }
      });
      const b = makeItem({
        id: "2",
        flags: { transformations: { sourceUuid: "y" } }
      });

      const actor = makeActor({ items: [a, b] });

      const count = await repo.removeBySourceUuid(actor, "x");

      expect(count).toBe(1);
      expect(actor.deleteEmbeddedDocuments).toHaveBeenCalledWith(
        "Item",
        ["1"]
      );
    });
  });
});
