import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTransformationQueryService } from
  "@src/services/transformations/createTransformationQueryService.js";

describe("createTransformationQueryService", () => {
  let transformationRegistry;
  let compendiumRepository;
  let transformationDefinitionFactory;
  let transformationInstanceFactory;
  let service;

  const entry = {
    itemId: "item-1",
    uuid: "Compendium.test.item",
    TransformationClass: class {},
    TransformationStages: [1, 2],
    TransformationTriggers: {},
  };

  const item = { name: "Transformation Item" };
  const definition = { id: "item-1" };

  beforeEach(() => {
    transformationRegistry = {
      getEntryForActor: vi.fn(),
      getEntryByItemId: vi.fn(),
      getAllEntries: vi.fn(),
    };

    compendiumRepository = {
      getDocumentByUuid: vi.fn(),
    };

    transformationDefinitionFactory = {
      create: vi.fn(),
    };

    transformationInstanceFactory = {
      create: vi.fn(),
    };

    service = createTransformationQueryService({
      transformationRegistry,
      compendiumRepository,
      transformationDefinitionFactory,
      transformationInstanceFactory,
    });
  });

  /* ------------------------------------------------------------------ */
  /* getForActor                                                        */
  /* ------------------------------------------------------------------ */

  it("returns null if actor is missing", async () => {
    const result = await service.getForActor(null);
    expect(result).toBeNull();
  });

  it("returns null if no registry entry for actor", async () => {
    transformationRegistry.getEntryForActor.mockReturnValue(null);

    const result = await service.getForActor({});

    expect(result).toBeNull();
  });

  it("returns null if definition cannot be resolved", async () => {
    transformationRegistry.getEntryForActor.mockReturnValue(entry);
    compendiumRepository.getDocumentByUuid.mockResolvedValue(null);

    const result = await service.getForActor({});

    expect(result).toBeNull();
  });

  it("returns transformation instance for valid actor", async () => {
    const actor = {
      flags: {
        dnd5e: {
          transformationStage: 2,
        },
      },
    };

    transformationRegistry.getEntryForActor
      .mockReturnValue(entry);

    compendiumRepository.getDocumentByUuid
      .mockResolvedValue(item);

    transformationDefinitionFactory.create
      .mockReturnValue(definition);

    const instance = { actor, definition };

    transformationInstanceFactory.create
      .mockReturnValue(instance);

    const result = await service.getForActor(actor);

    expect(transformationInstanceFactory.create)
      .toHaveBeenCalledWith({
        actor,
        definition,
        stage: 2,
        TransformationClass: entry.TransformationClass,
      });

    expect(result).toBe(instance);
  });

  /* ------------------------------------------------------------------ */
  /* getDefinitionById                                                   */
  /* ------------------------------------------------------------------ */

  it("returns null if itemId is missing", async () => {
    const result = await service.getDefinitionById(null);
    expect(result).toBeNull();
  });

  it("returns null if registry entry not found", async () => {
    transformationRegistry.getEntryByItemId
      .mockReturnValue(null);

    const result = await service.getDefinitionById("item-1");

    expect(result).toBeNull();
  });

  it("returns definition for valid itemId", async () => {
    transformationRegistry.getEntryByItemId
      .mockReturnValue(entry);

    compendiumRepository.getDocumentByUuid
      .mockResolvedValue(item);

    transformationDefinitionFactory.create
      .mockReturnValue(definition);

    const result = await service.getDefinitionById("item-1");

    expect(transformationDefinitionFactory.create)
      .toHaveBeenCalledWith({
        id: entry.itemId,
        uuid: entry.uuid,
        item,
        TransformationClass: entry.TransformationClass,
        stages: entry.TransformationStages,
        triggers: entry.TransformationTriggers,
      });

    expect(result).toBe(definition);
  });

  /* ------------------------------------------------------------------ */
  /* getAll                                                             */
  /* ------------------------------------------------------------------ */

  it("returns all resolved transformation definitions", async () => {
    transformationRegistry.getAllEntries
      .mockReturnValue([entry]);

    compendiumRepository.getDocumentByUuid
      .mockResolvedValue(item);

    transformationDefinitionFactory.create
      .mockReturnValue(definition);

    const result = await service.getAll();

    expect(result).toEqual([
      {
        itemId: entry.itemId,
        initialized: true,
        definition,
      },
    ]);
  });

  it("filters out entries with unresolved definitions", async () => {
    transformationRegistry.getAllEntries
      .mockReturnValue([entry]);

    compendiumRepository.getDocumentByUuid
      .mockResolvedValue(null);

    const result = await service.getAll();

    expect(result).toEqual([]);
  });

  /* ------------------------------------------------------------------ */
  /* Immutability                                                       */
  /* ------------------------------------------------------------------ */

  it("returns a frozen service", () => {
    expect(Object.isFrozen(service)).toBe(true);
  });
});
