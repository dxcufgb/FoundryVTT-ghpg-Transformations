import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCreatureTypeService } from
  "@src/infrastructure/foundry/creatureSubTypeService.js";

describe("createCreatureTypeService", () => {
  let actor;
  let actorRepository;
  let itemRepository;
  let utils;
  let logger;
  let service;

  beforeEach(() => {
    actor = {
      id: "actor-1",
      system: {
        details: {
          type: {
            value: "humanoid",
            subtype: ""
          }
        }
      },
      update: vi.fn(async () => {})
    };

    actorRepository = {
      setCreatureTypeFlags: vi.fn(async () => {}),
      getCreatureTypeFlags: vi.fn(),
      clearCreatureTypeFlags: vi.fn(async () => {})
    };

    itemRepository = {
      findEmbeddedByType: vi.fn(),
      updateEmbedded: vi.fn(async () => {})
    };

    utils = {
      stringUtils: {
        capitalize: vi.fn(str =>
          str.charAt(0).toUpperCase() + str.slice(1)
        )
      }
    };

    logger = {
      debug: vi.fn()
    };

    service = createCreatureTypeService({
      actorRepository,
      itemRepository,
      utils,
      logger
    });
  });

  describe("applyCreatureSubType", () => {
    it("does nothing when actor is missing", async () => {
      await service.applyCreatureSubType(null, "undead");
      expect(actorRepository.setCreatureTypeFlags).not.toHaveBeenCalled();
    });

    it("does nothing when subtype is missing", async () => {
      await service.applyCreatureSubType(actor, null);
      expect(actorRepository.setCreatureTypeFlags).not.toHaveBeenCalled();
    });

    it("stores base and added subtype flags", async () => {
      await service.applyCreatureSubType(actor, "undead");

      expect(actorRepository.setCreatureTypeFlags).toHaveBeenCalledWith(
        actor,
        {
          base: "humanoid",
          added: ["undead"]
        }
      );
    });

    it("updates race item subtype when race item exists", async () => {
      const raceItem = { id: "race-1" };
      itemRepository.findEmbeddedByType.mockReturnValue(raceItem);

      await service.applyCreatureSubType(actor, "undead");

      expect(itemRepository.updateEmbedded).toHaveBeenCalledWith(
        raceItem,
        {
          "system.type.subtype": "Undead"
        }
      );
    });

    it("does not update race item if none exists", async () => {
      itemRepository.findEmbeddedByType.mockReturnValue(null);

      await service.applyCreatureSubType(actor, "undead");

      expect(itemRepository.updateEmbedded).not.toHaveBeenCalled();
    });
  });

  describe("restoreBaseCreatureType", () => {
    it("does nothing when actor is missing", async () => {
      await service.restoreBaseCreatureType(null);
      expect(actorRepository.clearCreatureTypeFlags).not.toHaveBeenCalled();
    });

    it("does nothing when no creature type flags exist", async () => {
      actorRepository.getCreatureTypeFlags.mockReturnValue(null);

      await service.restoreBaseCreatureType(actor);

      expect(actor.update).not.toHaveBeenCalled();
      expect(actorRepository.clearCreatureTypeFlags).not.toHaveBeenCalled();
    });

    it("clears race subtype if it was added", async () => {
      actor.system.details.type.subtype = "undead";

      actorRepository.getCreatureTypeFlags.mockReturnValue({
        base: "humanoid",
        added: ["undead"]
      });

      const raceItem = { id: "race-1" };
      itemRepository.findEmbeddedByType.mockReturnValue(raceItem);

      await service.restoreBaseCreatureType(actor);

      expect(itemRepository.updateEmbedded).toHaveBeenCalledWith(
        raceItem,
        {
          "system.type.subtype": ""
        }
      );
    });

    it("restores base creature type if changed", async () => {
      actor.system.details.type.value = "undead";

      actorRepository.getCreatureTypeFlags.mockReturnValue({
        base: "humanoid",
        added: ["undead"]
      });

      await service.restoreBaseCreatureType(actor);

      expect(actor.update).toHaveBeenCalledWith({
        "system.details.type.value": "humanoid"
      });
    });

    it("clears creature type flags at the end", async () => {
      actorRepository.getCreatureTypeFlags.mockReturnValue({
        base: "humanoid",
        added: ["undead"]
      });

      await service.restoreBaseCreatureType(actor);

      expect(actorRepository.clearCreatureTypeFlags).toHaveBeenCalledWith(actor);
    });
  });
});
